-- Add UPDATE policy for Users table so users can edit their own profile
CREATE POLICY "Users can update their own row"
ON public."Users"
FOR UPDATE
TO authenticated
USING (auth_uid = auth.uid())
WITH CHECK (auth_uid = auth.uid());