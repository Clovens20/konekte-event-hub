-- Add policy for admin_users table (admins only)
CREATE POLICY "Admins can read admin users" ON public.admin_users FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));