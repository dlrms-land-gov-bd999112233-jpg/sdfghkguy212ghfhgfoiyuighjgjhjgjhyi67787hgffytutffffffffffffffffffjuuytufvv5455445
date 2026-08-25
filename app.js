(function(){
  const cfg=window.APP_CONFIG||{};
  const valid=cfg.SUPABASE_URL&&!cfg.SUPABASE_URL.includes('PASTE_')&&cfg.SUPABASE_ANON_KEY&&!cfg.SUPABASE_ANON_KEY.includes('PASTE_');
  const params=new URLSearchParams(location.search),id=params.get('id');
  const missing=()=>{const c=document.getElementById('record-card');if(!c)return;c.innerHTML='<div style="min-height:180px;display:flex;align-items:center;justify-content:center;text-align:center"><h1 style="color:#111">কোন খতিয়ান পাওয়া যায়নি</h1></div>'};
  const error=()=>{const c=document.getElementById('record-card');if(!c)return;c.innerHTML='<div style="min-height:180px;display:flex;align-items:center;justify-content:center;text-align:center"><h1 style="color:#111">তথ্য লোড করা যাচ্ছে না</h1></div>'};
  function show(r){['khatian','owner','dag_no','survey','mouza','upazila','district','division','record_date'].forEach(k=>{const e=document.getElementById(k);if(e)e.textContent=r[k]??''})}
  if(valid&&window.supabase){const client=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);(async()=>{let q=client.from('land_records').select('id,khatian,owner,dag_no,survey,mouza,upazila,district,division,record_date');if(id!==null){if(!/^\d+$/.test(id))return missing();q=q.eq('id',Number(id))}else q=q.order('id',{ascending:false}).limit(1);const {data,error:e}=await q.maybeSingle();if(e)return error();if(!data)return missing();show(data)})().catch(error)}else{error()}
  const date=document.getElementById('live-date'); if(date){const f=new Intl.DateTimeFormat('bn-BD',{timeZone:'Asia/Dhaka',weekday:'long',day:'numeric',month:'long',year:'numeric'});date.textContent=f.format(new Date())}
})();
