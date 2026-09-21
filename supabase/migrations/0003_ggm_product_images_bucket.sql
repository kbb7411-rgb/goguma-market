-- 상품 사진 저장소. public = true 라서 URL만 알면 누구나 볼 수 있다.
-- ※ 이미 적용되어 있습니다. 기록용.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ggm-products',
  'ggm-products',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 업로드 경로 규칙: <user_id>/<uuid>.<ext>
-- 즉 첫 번째 폴더 이름이 본인 uid일 때만 쓰기/수정/삭제할 수 있다.

drop policy if exists "ggm_products_images_read" on storage.objects;
create policy "ggm_products_images_read"
  on storage.objects for select
  using (bucket_id = 'ggm-products');

drop policy if exists "ggm_products_images_insert" on storage.objects;
create policy "ggm_products_images_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'ggm-products'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "ggm_products_images_update" on storage.objects;
create policy "ggm_products_images_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'ggm-products'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "ggm_products_images_delete" on storage.objects;
create policy "ggm_products_images_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'ggm-products'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
