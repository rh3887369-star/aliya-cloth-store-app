import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fflpudkjyvpfexwtdqvn.supabase.co'
const supabaseKey = 'sb_publishable_lne38Q5bfFTFBnO_aKWm1Q_u2OvLJbT'

export const supabase = createClient(supabaseUrl, supabaseKey)