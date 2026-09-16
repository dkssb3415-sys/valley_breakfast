import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ndpyrwdofzmzcqhzjvgv.supabase.co';
const supabaseAnonKey = 'sb_publishable_pUxKJwiypbkLeGJHNo4Ttw_da2z80iv';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
