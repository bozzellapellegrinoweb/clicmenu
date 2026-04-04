-- Permetti UPDATE (sovrascrittura) sui file storage
create policy "Users can update their menu photos"
  on storage.objects for update
  using (bucket_id = 'menu-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their logos"
  on storage.objects for update
  using (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);
