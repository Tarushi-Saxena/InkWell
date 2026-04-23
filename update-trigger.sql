-- Run this in your Supabase SQL Editor to allow Users to select their roles during Signup!

create or replace function public.handle_new_user()
returns trigger as $$
declare
  requested_role text;
begin
  -- Read the requested role from the Auth metadata (passed from the frontend)
  requested_role := new.raw_user_meta_data->>'role';

  -- Enforce valid roles natively, default to Viewer if tampered
  if requested_role not in ('Admin', 'Author', 'Viewer') then
    requested_role := 'Viewer';
  end if;

  -- Insert the profile using the dynamically assigned role
  insert into public.profiles (id, email, name, role)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 
    requested_role
  );
  return new;
end;
$$ language plpgsql security definer;
