-- "Solo uso interno" documents must not be downloadable by anyone with the
-- link. Make the bucket private; anonymous visitors may read (and therefore
-- obtain short-lived signed URLs for) only files of documents marked public.
-- Admins keep full access via "admin manage documenti files".
-- Files are served through the site route /documenti/file/[id].
-- (Applied to the hosted project; kept for reproducibility.)

update storage.buckets set public = false where id = 'documenti';

create or replace function public.documento_file_pubblico(p_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.documenti d where d.storage_path = p_name and d.pubblico)
$$;

drop policy if exists "public read published documenti files" on storage.objects;
create policy "public read published documenti files" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'documenti' and public.documento_file_pubblico(name));
