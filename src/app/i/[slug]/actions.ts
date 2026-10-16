"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
export type RsvpResult = { ok: true } | { ok: false; error: string };
export async function submitRsvp(_prev:RsvpResult|null, form:FormData):Promise<RsvpResult> {
  const slug=String(form.get('slug')??''), token=String(form.get('token')??'');
  const status=String(form.get('attending'));
  const count=status==='no'?0:Number(form.get('attending_count'));
  if(!/^[a-f0-9]{64}$/.test(token) || !['yes','no'].includes(status) || !Number.isInteger(count) || count<0 || count>100 || (status==='yes'&&count===0)) return {ok:false,error:'Please use your personal invitation link and select your attendance.'};
  try {
    const supabase=await createClient();
    const {error}=await supabase.rpc('respond_to_invitation',{p_slug:slug,p_token:token,p_attending:count,p_message:String(form.get('message')??'').slice(0,1000),p_dietary:String(form.get('dietary')??'').slice(0,500)});
    if(error) return {ok:false,error:error.message.includes('function')?'RSVP is being prepared. Please contact the couple.':error.message};
    revalidatePath('/dashboard','layout'); revalidatePath('/i/'+slug);
    return {ok:true};
  } catch {return {ok:false,error:'Your response could not be saved. Check your connection and try again.'};}
}
