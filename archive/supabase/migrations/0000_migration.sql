CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  short_description text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_url text,
  department text,
  featured boolean NOT NULL DEFAULT false,
  seo_title text, seo_description text,
  published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  image_url text,
  published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'محیط مجموعه',
  media_type text NOT NULL DEFAULT 'image' CHECK (media_type IN ('image','video')),
  media_url text NOT NULL,
  thumbnail_url text,
  alt text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  cover_url text,
  seo_title text, seo_description text,
  published_at timestamptz NOT NULL DEFAULT now(),
  published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text,
  price_text text,
  published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.appointment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  mobile text NOT NULL CHECK (mobile ~ '^09[0-9]{9}$'),
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  department text CHECK (department IS NULL OR department IN ('پوست','لیزر')),
  notes text CHECK (notes IS NULL OR char_length(notes) <= 1000),
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['site_settings','services','doctors','gallery_items','blog_posts','products'] LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated', t);
    EXECUTE format('GRANT INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "public read published" ON public.%I FOR SELECT TO anon, authenticated USING (published OR public.has_role(auth.uid(),''admin''))', t);
    EXECUTE format('CREATE POLICY "admin write" ON public.%I FOR ALL TO authenticated USING (public.has_role(auth.uid(),''admin'')) WITH CHECK (public.has_role(auth.uid(),''admin''))', t);
  END LOOP;
END $$;

GRANT INSERT ON public.appointment_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.appointment_requests TO authenticated;
GRANT ALL ON public.appointment_requests TO service_role;
ALTER TABLE public.appointment_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can request" ON public.appointment_requests FOR INSERT TO anon, authenticated WITH CHECK (status = 'new');
CREATE POLICY "admin read requests" ON public.appointment_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update requests" ON public.appointment_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete requests" ON public.appointment_requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "media public read" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "media admin insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "media admin update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "media admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.has_role(auth.uid(),'admin'));

INSERT INTO public.site_settings (key, value) VALUES
('clinic', '{"name":"مجتمع پزشکی و زیبایی پردیس","manager":"دکتر شاهین غلامی","address":"بابل، میدان باغ فردوس، خیابان بابل‌کلینیک، ابتدای خیابان خورشیدکلا، پشت کبابی سهیل","instagram":"https://www.instagram.com/clinic_pardis_babol/","instagram_handle":"clinic_pardis_babol","phones":[{"label":"بخش پوست","number":"011-44420302"},{"label":"بخش لیزر","number":"011-44420301"}]}'),
('hero', '{"title":"مجتمع پزشکی و زیبایی پردیس","subtitle":"خدمات تخصصی پوست، مو و زیبایی در بابل","primary_cta":"درخواست نوبت","secondary_cta":"تماس با ما"}'),
('about', '{"title":"درباره پردیس","text":"مجتمع پزشکی و زیبایی پردیس در بابل، با مدیریت دکتر شاهین غلامی، خدمات تخصصی پوست، مو و زیبایی را در فضایی آرام و حرفه‌ای ارائه می‌دهد. در پردیس، هر درمان پس از معاینه و مشاوره تخصصی و متناسب با شرایط هر فرد برنامه‌ریزی می‌شود."}'),
('theme', '{"primary":"#7B6A8D","lavender":"#E9E3EF","lavender_deep":"#C9BFD5","ink":"#111111"}'),
('disclaimer', '{"text":"نتیجه درمان‌ها بسته به شرایط هر فرد متفاوت است. پیش از هر اقدام، مشاوره تخصصی پزشک ضروری است."}');

INSERT INTO public.doctors (name, role, bio, sort_order) VALUES
('دکتر شاهین غلامی','مدیر مجموعه','فارغ‌التحصیل رشته تخصصی پوست و زیبایی از دانشگاه YSMU.',1),
('دکتر فروزان قلی‌پور','پزشک مجموعه','پزشک مجموعه پردیس و همراه مراجعین در مسیر مشاوره و درمان.',2);

INSERT INTO public.services (slug,title,short_description,description,image_url,department,featured,sort_order) VALUES
('skin-repair','ترمیم آسیب‌های پوستی','درمان اسکار، آکنه و جای جوش با روش‌های متناسب با نوع و عمق آسیب پوست.','آسیب‌هایی مانند اسکار، آکنه فعال و جای جوش می‌توانند بر بافت و یکنواختی پوست اثر بگذارند. در این خدمت، پس از معاینه پوست و بررسی نوع و عمق آسیب، روش یا ترکیبی از روش‌های مناسب پیشنهاد می‌شود. تعداد جلسات و روند بهبود در هر فرد متفاوت است و برنامه درمان در جلسه مشاوره تعیین می‌شود.','/images/services/skin.jpg','پوست',true,1),
('subcision','سابسیژن (رفع جای جوش)','روشی برای آزادسازی باندهای زیر پوستی در جای جوش‌های فرورفته.','سابسیژن روشی کم‌تهاجمی است که در آن باندهای فیبری زیر جای جوش‌های فرورفته آزاد می‌شوند تا سطح پوست یکنواخت‌تر شود. این روش اغلب همراه با درمان‌های تکمیلی انجام می‌شود. مناسب بودن آن برای هر فرد پس از معاینه پزشک مشخص می‌شود.','/images/services/skin.jpg','پوست',false,2),
('co2-fractional','لیزر CO2 فرکشنال پوست','ترمیم زخم و جای جوش، برداشت خال و جوانسازی پوست با لیزر CO2 فرکشنال.','لیزر CO2 فرکشنال با ایجاد ستون‌های بسیار ریز حرارتی در پوست، روند طبیعی ترمیم پوست را تحریک می‌کند. از این لیزر برای ترمیم زخم و جای جوش، برداشت برخی خال‌ها و جوانسازی پوست استفاده می‌شود. مراقبت‌های پس از لیزر اهمیت زیادی دارد و در جلسه مشاوره توضیح داده می‌شود.','/images/services/laser.jpg','لیزر',true,3),
('botox','تزریق بوتاکس','کاهش خطوط حالتی صورت با تزریق دقیق و حساب‌شده.','بوتاکس با شل کردن موقت عضلات حالت‌دهنده، به کاهش خطوط حالتی مانند خطوط پیشانی و دور چشم کمک می‌کند. میزان و محل تزریق پس از ارزیابی چهره و متناسب با حالت طبیعی صورت هر فرد تعیین می‌شود. ماندگاری اثر در افراد مختلف متفاوت است.','/images/services/injection.jpg','پوست',true,4),
('botox-hyperhidrosis','درمان تعریق با بوتاکس','کنترل تعریق موضعی در نواحی مانند زیر بغل و کف دست.','تزریق بوتاکس یکی از روش‌های درمان تعریق موضعی بیش از حد است. این روش با کاهش فعالیت غدد عرق در ناحیه درمان عمل می‌کند. پیش از درمان، پزشک شرایط و سابقه پزشکی شما را بررسی می‌کند.','/images/services/injection.jpg','پوست',false,5),
('filler','تزریق فیلر','بازگرداندن حجم و اصلاح فرم نواحی مختلف صورت.','فیلرها موادی قابل تزریق هستند که برای جبران کاهش حجم و اصلاح فرم نواحی مانند گونه و چانه به کار می‌روند. انتخاب نوع فیلر و میزان تزریق پس از ارزیابی چهره و گفت‌وگو درباره انتظارات شما انجام می‌شود.','/images/services/injection.jpg','پوست',false,6),
('gel-injection','تزریق ژل','ژل لب، اصلاح خط خنده و بینی با رعایت تناسب چهره.','تزریق ژل برای حجم‌دهی لب، کاهش عمق خط خنده و اصلاح جزئی فرم بینی استفاده می‌شود. هدف، نتیجه‌ای هماهنگ با تناسب طبیعی چهره است. پزشک پیش از تزریق، روش و محدودیت‌ها را برای شما توضیح می‌دهد.','/images/services/injection.jpg','پوست',true,7),
('renuvion','لیپوساکشن به روش رنوویون','روشی برای کاهش چربی موضعی و کمک به سفتی پوست.','رنوویون فناوری‌ای است که در کنار لیپوساکشن برای کمک به سفت شدن پوست ناحیه درمان به کار می‌رود. این روش برای همه افراد مناسب نیست و تصمیم درباره آن پس از معاینه و مشاوره تخصصی گرفته می‌شود.','/images/services/body.jpg',NULL,false,8),
('cryotherapy','رفع ضایعات پوستی با کرایوتراپی','درمان برخی ضایعات سطحی پوست با سرما.','کرایوتراپی با استفاده از سرمای شدید و کنترل‌شده، برخی ضایعات سطحی پوست مانند زگیل را درمان می‌کند. نوع ضایعه باید پیش از درمان توسط پزشک تشخیص داده شود.','/images/services/skin.jpg','پوست',false,9),
('facial','فیشال و پاکسازی صورت','پاکسازی عمیق و مراقبت تخصصی متناسب با نوع پوست.','فیشال و پاکسازی صورت شامل مراحل پاک‌کردن، لایه‌برداری ملایم، پاکسازی منافذ و آبرسانی است. مراحل و محصولات بر اساس نوع و شرایط پوست هر فرد انتخاب می‌شوند.','/images/services/facial.jpg','پوست',true,10),
('mesotherapy','مزوتراپی','تزریق سطحی ترکیبات مغذی برای پوست و مو.','مزوتراپی روشی است که در آن ترکیبات مغذی به‌صورت سطحی به پوست یا پوست سر تزریق می‌شوند. این روش برای بهبود شادابی پوست یا کمک به وضعیت مو به کار می‌رود و تعداد جلسات آن توسط پزشک تعیین می‌شود.','/images/services/injection.jpg','پوست',false,11),
('hair-transplant','کاشت مو و ابرو','کاشت مو و ابرو با طراحی متناسب با چهره.','کاشت مو و ابرو برای ترمیم نواحی کم‌پشت یا فاقد مو انجام می‌شود. طراحی خط رویش و تعداد گرافت‌ها پس از معاینه و بررسی ناحیه اهدا تعیین می‌شود.','/images/services/hair.jpg',NULL,false,12),
('candela-laser','لیزر موهای زائد','لیزر موهای زائد با دستگاه آمریکایی کندلا.','لیزر موهای زائد با دستگاه آمریکایی کندلا انجام می‌شود. تعداد جلسات و فاصله آن‌ها به نوع پوست، رنگ و ضخامت مو و ناحیه درمان بستگی دارد و در جلسه مشاوره مشخص می‌شود.','/images/services/laser.jpg','لیزر',true,13),
('surgery','جراحی','جراحی‌های سرپایی پوست و زیبایی در محیطی استاندارد.','برخی خدمات پوست و زیبایی نیازمند جراحی هستند. نوع جراحی، آمادگی‌های لازم و مراقبت‌های پس از آن در جلسه مشاوره با پزشک بررسی می‌شود.','/images/services/body.jpg',NULL,false,14);

INSERT INTO public.gallery_items (title,category,media_type,media_url,alt,sort_order) VALUES
('فضای پذیرش','محیط مجموعه','image','/images/gallery/reception.jpg','فضای پذیرش مجتمع پردیس',1),
('اتاق درمان','محیط مجموعه','image','/images/gallery/room.jpg','اتاق درمان مجتمع پردیس',2),
('تجهیزات لیزر','تجهیزات','image','/images/services/laser.jpg','دستگاه لیزر',3),
('مراقبت پوست','مراقبت پوست','image','/images/services/facial.jpg','مراقبت تخصصی پوست',4),
('محصولات مراقبتی','مراقبت پوست','image','/images/gallery/products.jpg','محصولات مراقبت از پوست',5),
('تزریقات','تجهیزات','image','/images/services/injection.jpg','وسایل تزریق',6);

INSERT INTO public.blog_posts (slug,title,excerpt,content,cover_url,seo_title,seo_description,published_at,sort_order) VALUES
('skin-care-basics','اصول اولیه مراقبت از پوست','سه گام ساده که پایه هر روال مراقبت از پوست است.',E'## چرا روال ساده مهم است؟\n\nمراقبت از پوست لازم نیست پیچیده باشد. یک روال ساده و منظم، معمولاً از ده محصول نامنظم مفیدتر است.\n\n## سه گام پایه\n\n1. **پاک‌کردن ملایم:** صبح و شب با شوینده‌ای متناسب با نوع پوست.\n2. **آبرسانی:** استفاده از مرطوب‌کننده، حتی برای پوست‌های چرب.\n3. **محافظت از آفتاب:** مهم‌ترین گام برای سلامت بلندمدت پوست.\n\n## نکته\n\nاگر پوست حساس یا مشکل خاصی دارید، پیش از استفاده از محصول جدید با پزشک مشورت کنید.','/images/blog/skincare.jpg','اصول اولیه مراقبت از پوست | پردیس','راهنمای ساده سه گام پایه مراقبت روزانه از پوست.',now() - interval '10 days',1),
('sun-protection','محافظت از پوست در برابر آفتاب','چرا ضدآفتاب در همه فصل‌ها اهمیت دارد و چطور درست استفاده کنیم.',E'## آفتاب و پوست\n\nپرتوهای فرابنفش در همه فصل‌ها، حتی در روزهای ابری، به پوست می‌رسند و در طول زمان بر سلامت آن اثر می‌گذارند.\n\n## چند توصیه کاربردی\n\n- از ضدآفتاب با طیف گسترده استفاده کنید.\n- مقدار کافی بزنید و هر دو تا سه ساعت در فضای باز تمدید کنید.\n- کلاه و عینک آفتابی را فراموش نکنید.\n\n## پس از درمان‌های پوستی\n\nپس از لیزر و برخی درمان‌ها، محافظت از آفتاب اهمیت بیشتری دارد. توصیه‌های پزشک خود را دنبال کنید.','/images/blog/sun.jpg','محافظت از پوست در برابر آفتاب | پردیس','نکات کاربردی استفاده درست از ضدآفتاب در همه فصل‌ها.',now() - interval '5 days',2),
('before-laser','پیش از جلسه لیزر چه بدانیم؟','آمادگی‌های ساده‌ای که پیش از جلسه لیزر بهتر است بدانید.',E'## مشاوره، اولین قدم\n\nپیش از هر جلسه لیزر، پزشک نوع پوست، سابقه پزشکی و داروهای مصرفی شما را بررسی می‌کند.\n\n## پیش از جلسه\n\n- چند هفته پیش از لیزر از برنزه شدن و آفتاب مستقیم پرهیز کنید.\n- داروها و مکمل‌های مصرفی خود را به پزشک اطلاع دهید.\n- طبق توصیه، ناحیه را آماده کنید.\n\n## پس از جلسه\n\nمراقبت‌های پس از لیزر را دقیقاً رعایت کنید و در صورت هر نگرانی با مجموعه تماس بگیرید.','/images/blog/laser.jpg','پیش از جلسه لیزر چه بدانیم؟ | پردیس','آمادگی‌ها و نکات مهم پیش و پس از جلسه لیزر.',now() - interval '1 day',3);