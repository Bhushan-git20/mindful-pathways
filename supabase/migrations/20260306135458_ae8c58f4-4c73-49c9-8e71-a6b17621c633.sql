
-- Update crisis resources to Indian helplines
UPDATE public.resources SET 
  title = 'iCall - Psychosocial Helpline',
  description = 'Call 9152987821 for professional counseling support',
  external_url = 'https://icallhelpline.org/'
WHERE id = 'bef7013a-8035-4a08-a1b6-88e4a01c867e';

UPDATE public.resources SET 
  title = 'Vandrevala Foundation Helpline',
  description = 'Call 1860-2662-345 for 24/7 mental health support',
  external_url = 'https://www.vandrevalafoundation.com/'
WHERE id = '35108fe5-cf93-4ab2-9994-f38a6c674105';

UPDATE public.resources SET 
  title = 'NIMHANS Helpline',
  description = 'Call 080-46110007 for mental health assistance',
  external_url = 'https://nimhans.ac.in/'
WHERE id = 'fe6c9e4c-d7a1-4676-bcbd-a54877da1de9';
