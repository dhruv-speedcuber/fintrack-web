"use client";

import { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis } from "recharts";

const INR = n => '₹' + Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:0});
const PIE_COLORS = ['#4f46e5','#10b981','#f59e0b','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#ef4444'];
const ACCT_TYPES = ['Bank','Cash','Digital Wallet','Fixed Deposit','Other'];
const INV_TYPES  = ['Stocks','Crypto','Mutual Fund','Gold','Real Estate','Other'];
const LIAB_TYPES = ['Home Loan','Car Loan','Personal Loan','Credit Card Due','Other'];
const ACCT_ICONS = {Bank:'🏦',Cash:'💵','Digital Wallet':'📱','Fixed Deposit':'🔒',Other:'💳'};
const ACCT_CLR   = {Bank:'#3b82f6',Cash:'#10b981','Digital Wallet':'#8b5cf6','Fixed Deposit':'#f59e0b',Other:'#64748b'};
const INV_ICONS  = {Stocks:'📊',Crypto:'₿','Mutual Fund':'📈',Gold:'🥇','Real Estate':'🏠',Other:'💼'};
const INV_CLR    = {Stocks:'#3b82f6',Crypto:'#f59e0b','Mutual Fund':'#10b981',Gold:'#ca8a04','Real Estate':'#8b5cf6',Other:'#64748b'};

const G = {
  card:  {background:'#fff',borderRadius:16,padding:16,marginBottom:12,boxShadow:'0 1px 4px rgba(0,0,0,0.07)'},
  btn:   {background:'#4f46e5',color:'#fff',border:'none',borderRadius:10,padding:'12px 20px',fontSize:14,fontWeight:600,cursor:'pointer'},
  btnSm: {background:'#4f46e5',color:'#fff',border:'none',borderRadius:8,padding:'8px 14px',fontSize:13,fontWeight:600,cursor:'pointer'},
  btnOut:{background:'transparent',color:'#475569',border:'1px solid #e2e8f0',borderRadius:10,padding:'12px 20px',fontSize:14,cursor:'pointer'},
  btnRed:{background:'#ef4444',color:'#fff',border:'none',borderRadius:10,padding:'12px 20px',fontSize:14,fontWeight:600,cursor:'pointer'},
  inp:   {width:'100%',padding:'11px 14px',borderRadius:10,border:'1px solid #e2e8f0',fontSize:14,boxSizing:'border-box',outline:'none',background:'#f8fafc',fontFamily:'system-ui'},
  sel:   {width:'100%',padding:'11px 14px',borderRadius:10,border:'1px solid #e2e8f0',fontSize:14,boxSizing:'border-box',background:'#f8fafc',fontFamily:'system-ui'},
  lbl:   {fontSize:13,fontWeight:600,color:'#475569',marginBottom:5,display:'block'},
  row:   {display:'flex',alignItems:'center',gap:12},
  chip:  c=>({background:c+'22',color:c,borderRadius:6,padding:'3px 9px',fontSize:11,fontWeight:700,display:'inline-block'}),
  ico:   c=>({width:44,height:44,borderRadius:12,background:c+'1a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}),
};

const DEMO = {
  accounts:[
    {id:1,name:'HDFC Savings',type:'Bank',balance:125000},
    {id:2,name:'Cash on Hand',type:'Cash',balance:5000},
    {id:3,name:'PhonePe',type:'Digital Wallet',balance:2500},
    {id:4,name:'LIC Fixed Deposit',type:'Fixed Deposit',balance:50000},
  ],
  investments:[
    {id:1,name:'Reliance Industries',type:'Stocks',invested:50000,current:62000,notes:'NSE'},
    {id:2,name:'Bitcoin',type:'Crypto',invested:30000,current:45000,notes:''},
    {id:3,name:'Axis Bluechip Fund',type:'Mutual Fund',invested:100000,current:118000,notes:'SIP ₹5k/mo'},
    {id:4,name:'Digital Gold',type:'Gold',invested:20000,current:22500,notes:''},
  ],
  goals:[
    {id:1,name:'🚗 Buy a Car',target:800000,saved:250000,date:'2027-06'},
    {id:2,name:'🏖️ Goa Trip',target:80000,saved:55000,date:'2026-12'},
    {id:3,name:'🛡️ Emergency Fund',target:300000,saved:180000,date:'2026-10'},
  ],
  liabilities:[
    {id:1,name:'Home Loan',type:'Home Loan',total:2500000,remaining:1800000,rate:8.5,emi:22000},
  ],
  snapshots:[
    {label:'Jan',nw:350000},{label:'Feb',nw:368000},{label:'Mar',nw:385000},
    {label:'Apr',nw:405000},{label:'May',nw:430000},{label:'Jun',nw:452000},
  ],
};

function Modal({type,form,ff,onSave,onClose}){
  const title=`${form.id?'Edit':'Add'} ${type.charAt(0).toUpperCase()+type.slice(1)}`;
  return(
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.6)',zIndex:200,display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:'22px 22px 0 0',padding:'20px 20px 32px',width:'100%',maxWidth:520,maxHeight:'92vh',overflowY:'auto'}}>
        <div style={{width:40,height:4,background:'#e2e8f0',borderRadius:2,margin:'0 auto 18px'}}/>
        <div style={{...G.row,justifyContent:'space-between',marginBottom:18}}>
          <div style={{fontWeight:800,fontSize:18}}>{title}</div>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8',lineHeight:1}}>✕</button>
        </div>
        {type==='account'&&<>
          <div style={{marginBottom:14}}><label style={G.lbl}>Account Name</label><input style={G.inp} value={form.name||''} onChange={e=>ff('name',e.target.value)} placeholder="e.g. HDFC Savings"/></div>
          <div style={{marginBottom:14}}><label style={G.lbl}>Type</label><select style={G.sel} value={form.type||'Bank'} onChange={e=>ff('type',e.target.value)}>{ACCT_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
          <div style={{marginBottom:14}}><label style={G.lbl}>Balance (₹)</label><input style={G.inp} type="number" value={form.balance===undefined?'':form.balance} onChange={e=>ff('balance',e.target.value)} placeholder="0"/></div>
        </>}
        {type==='investment'&&<>
          <div style={{marginBottom:14}}><label style={G.lbl}>Name</label><input style={G.inp} value={form.name||''} onChange={e=>ff('name',e.target.value)} placeholder="e.g. Nifty 50 Index Fund"/></div>
          <div style={{marginBottom:14}}><label style={G.lbl}>Type</label><select style={G.sel} value={form.type||'Stocks'} onChange={e=>ff('type',e.target.value)}>{INV_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
            <div><label style={G.lbl}>Invested (₹)</label><input style={G.inp} type="number" value={form.invested||''} onChange={e=>ff('invested',e.target.value)} placeholder="0"/></div>
            <div><label style={G.lbl}>Current Value (₹)</label><input style={G.inp} type="number" value={form.current||''} onChange={e=>ff('current',e.target.value)} placeholder="0"/></div>
          </div>
          <div style={{marginBottom:14}}><label style={G.lbl}>Notes (optional)</label><input style={G.inp} value={form.notes||''} onChange={e=>ff('notes',e.target.value)} placeholder="e.g. SIP ₹5000/mo"/></div>
        </>}
        {type==='goal'&&<>
          <div style={{marginBottom:14}}><label style={G.lbl}>Goal Name</label><input style={G.inp} value={form.name||''} onChange={e=>ff('name',e.target.value)} placeholder="e.g. 🏠 Buy a House"/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
            <div><label style={G.lbl}>Target Amount (₹)</label><input style={G.inp} type="number" value={form.target||''} onChange={e=>ff('target',e.target.value)} placeholder="0"/></div>
            <div><label style={G.lbl}>Saved So Far (₹)</label><input style={G.inp} type="number" value={form.saved||''} onChange={e=>ff('saved',e.target.value)} placeholder="0"/></div>
          </div>
          <div style={{marginBottom:14}}><label style={G.lbl}>Target Date</label><input style={G.inp} type="month" value={form.date||''} onChange={e=>ff('date',e.target.value)}/></div>
        </>}
        {type==='liability'&&<>
          <div style={{marginBottom:14}}><label style={G.lbl}>Name</label><input style={G.inp} value={form.name||''} onChange={e=>ff('name',e.target.value)} placeholder="e.g. Home Loan"/></div>
          <div style={{marginBottom:14}}><label style={G.lbl}>Type</label><select style={G.sel} value={form.type||'Home Loan'} onChange={e=>ff('type',e.target.value)}>{LIAB_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
            <div><label style={G.lbl}>Total Amount (₹)</label><input style={G.inp} type="number" value={form.total||''} onChange={e=>ff('total',e.target.value)} placeholder="0"/></div>
            <div><label style={G.lbl}>Remaining (₹)</label><input style={G.inp} type="number" value={form.remaining||''} onChange={e=>ff('remaining',e.target.value)} placeholder="0"/></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
            <div><label style={G.lbl}>Interest Rate (%)</label><input style={G.inp} type="number" step="0.1" value={form.rate||''} onChange={e=>ff('rate',e.target.value)} placeholder="8.5"/></div>
            <div><label style={G.lbl}>Monthly EMI (₹)</label><input style={G.inp} type="number" value={form.emi||''} onChange={e=>ff('emi',e.target.value)} placeholder="0"/></div>
          </div>
        </>}
        <div style={{display:'flex',gap:12,marginTop:8}}>
          <button onClick={onClose} style={{...G.btnOut,flex:1}}>Cancel</button>
          <button onClick={onSave} style={{...G.btn,flex:2}}>Save</button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({netWorth,totalAccounts,totalPortfolio,totalLiab,totalGain,totalInvested,allocation,snapshots,goals}){
  const gainPct=totalInvested>0?(totalGain/totalInvested*100).toFixed(1):0;
  const isPos=totalGain>=0;
  const totalAssets=totalAccounts+totalPortfolio;
  return(
    <div style={{padding:'16px 16px 4px'}}>
      <div style={{...G.card,background:'linear-gradient(135deg,#4338ca,#7c3aed)',padding:'22px 20px',color:'#fff'}}>
        <div style={{fontSize:12,opacity:0.8,marginBottom:4}}>Total Net Worth</div>
        <div style={{fontSize:32,fontWeight:800,letterSpacing:-1,marginBottom:16}}>{INR(netWorth)}</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
          {[{label:'Cash & Savings',val:INR(totalAccounts)},{label:'Liabilities',val:INR(totalLiab)},{label:`Portfolio ${isPos?'📈':'📉'}`,val:`${isPos?'+':''}${gainPct}%`}].map(({label,val})=>(
            <div key={label} style={{background:'rgba(255,255,255,0.13)',borderRadius:10,padding:'10px 8px'}}>
              <div style={{fontSize:10,opacity:0.75,marginBottom:3}}>{label}</div>
              <div style={{fontWeight:700,fontSize:13}}>{val}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
        {[{label:'Cash & Accounts',val:INR(totalAccounts),icon:'🏦',color:'#3b82f6'},{label:'Portfolio Value',val:INR(totalPortfolio),icon:'📈',color:'#10b981'},{label:'Amount Invested',val:INR(totalInvested),icon:'💰',color:'#8b5cf6'},{label:'Total Liabilities',val:INR(totalLiab),icon:'📋',color:'#ef4444'}].map(({label,val,icon,color})=>(
          <div key={label} style={{...G.card,marginBottom:0,display:'flex',flexDirection:'column',gap:4}}>
            <span style={{fontSize:24}}>{icon}</span>
            <span style={{fontSize:11,color:'#64748b'}}>{label}</span>
            <span style={{fontWeight:800,color,fontSize:16}}>{val}</span>
          </div>
        ))}
      </div>
      {allocation.length>0&&(
        <div style={G.card}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>Asset Allocation</div>
          <div style={{display:'flex',alignItems:'center',gap:4}}>
            <div style={{flexShrink:0}}>
              <PieChart width={150} height={150}>
                <Pie data={allocation} cx={70} cy={70} innerRadius={42} outerRadius={68} dataKey="value" paddingAngle={2}>
                  {allocation.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={v=>INR(v)} contentStyle={{borderRadius:8,fontSize:12}}/>
              </PieChart>
            </div>
            <div style={{flex:1,minWidth:0}}>
              {allocation.map((a,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:6,marginBottom:7}}>
                  <div style={{width:10,height:10,borderRadius:'50%',background:PIE_COLORS[i%PIE_COLORS.length],flexShrink:0}}/>
                  <div style={{fontSize:11,color:'#475569',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.name}</div>
                  <div style={{fontSize:11,fontWeight:700,flexShrink:0}}>{totalAssets>0?(a.value/totalAssets*100).toFixed(0):0}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {goals.length>0&&(
        <div style={G.card}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>Goals Overview</div>
          {goals.slice(0,3).map(g=>{
            const pct=Math.min(Number(g.saved)/Number(g.target)*100,100);
            return(
              <div key={g.id} style={{marginBottom:12}}>
                <div style={{...G.row,justifyContent:'space-between',marginBottom:4}}>
                  <div style={{fontSize:13,fontWeight:600}}>{g.name}</div>
                  <div style={{fontSize:12,color:pct>=100?'#10b981':'#64748b',fontWeight:600}}>{pct.toFixed(0)}%</div>
                </div>
                <div style={{background:'#f1f5f9',borderRadius:50,height:8,overflow:'hidden'}}>
                  <div style={{background:pct>=100?'#10b981':'linear-gradient(90deg,#4f46e5,#7c3aed)',height:'100%',width:`${pct}%`,borderRadius:50}}/>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {snapshots.length>=2&&(
        <div style={G.card}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>Net Worth Trend</div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={snapshots} margin={{top:5,right:10,left:-25,bottom:0}}>
              <XAxis dataKey="label" tick={{fontSize:10}}/>
              <YAxis tick={{fontSize:10}} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={v=>INR(v)} contentStyle={{borderRadius:8,fontSize:12}}/>
              <Line type="monotone" dataKey="nw" stroke="#4f46e5" strokeWidth={2.5} dot={{r:3,fill:'#4f46e5'}} name="Net Worth"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function Accounts({accounts,openModal,setDel}){
  const total=accounts.reduce((s,a)=>s+Number(a.balance),0);
  return(
    <div style={{padding:16}}>
      <div style={{...G.row,justifyContent:'space-between',marginBottom:16}}>
        <div><div style={{fontSize:12,color:'#64748b'}}>Total Balance</div><div style={{fontWeight:800,fontSize:24}}>{INR(total)}</div></div>
        <button style={G.btnSm} onClick={()=>openModal('account',{type:'Bank'})}>+ Add Account</button>
      </div>
      {accounts.map(a=>(
        <div key={a.id} style={{...G.card,...G.row,justifyContent:'space-between'}}>
          <div style={{...G.row,gap:12,minWidth:0}}>
            <div style={G.ico(ACCT_CLR[a.type]||'#64748b')}>{ACCT_ICONS[a.type]||'💳'}</div>
            <div style={{minWidth:0}}><div style={{fontWeight:600,fontSize:15,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.name}</div><span style={G.chip(ACCT_CLR[a.type]||'#64748b')}>{a.type}</span></div>
          </div>
          <div style={{textAlign:'right',flexShrink:0}}>
            <div style={{fontWeight:800,fontSize:16}}>{INR(a.balance)}</div>
            <div style={{...G.row,justifyContent:'flex-end',gap:10,marginTop:4}}>
              <button onClick={()=>openModal('account',{...a})} style={{background:'none',border:'none',fontSize:16,cursor:'pointer',padding:0}}>✏️</button>
              <button onClick={()=>setDel({type:'account',id:a.id,name:a.name})} style={{background:'none',border:'none',fontSize:16,cursor:'pointer',padding:0}}>🗑️</button>
            </div>
          </div>
        </div>
      ))}
      {accounts.length===0&&<div style={{textAlign:'center',color:'#94a3b8',padding:'40px 0',fontSize:14}}>No accounts yet. Add your first one!</div>}
    </div>
  );
}

function Investments({investments,openModal,setDel,totalInvested,totalPortfolio,totalGain}){
  const gainPct=totalInvested>0?(totalGain/totalInvested*100).toFixed(1):'0.0';
  return(
    <div style={{padding:16}}>
      <div style={{...G.card,background:'linear-gradient(135deg,#065f46,#059669)',color:'#fff',padding:'18px 16px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,textAlign:'center'}}>
          {[{label:'Invested',val:INR(totalInvested)},{label:'Current Value',val:INR(totalPortfolio)},{label:'Overall Return',val:`${totalGain>=0?'+':''}${gainPct}%`}].map(({label,val})=>(
            <div key={label} style={{background:'rgba(255,255,255,0.13)',borderRadius:10,padding:10}}>
              <div style={{fontSize:10,opacity:0.8,marginBottom:3}}>{label}</div>
              <div style={{fontWeight:700,fontSize:13}}>{val}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{...G.row,justifyContent:'space-between',marginBottom:12}}>
        <div style={{fontWeight:700,fontSize:16}}>Your Portfolio</div>
        <button style={G.btnSm} onClick={()=>openModal('investment',{type:'Stocks'})}>+ Add</button>
      </div>
      {investments.map(inv=>{
        const gain=Number(inv.current)-Number(inv.invested);
        const pct=Number(inv.invested)>0?(gain/Number(inv.invested)*100).toFixed(1):'0.0';
        const pos=gain>=0;
        return(
          <div key={inv.id} style={G.card}>
            <div style={{...G.row,justifyContent:'space-between',marginBottom:10}}>
              <div style={{...G.row,gap:10,minWidth:0}}>
                <div style={G.ico(INV_CLR[inv.type]||'#64748b')}>{INV_ICONS[inv.type]||'💼'}</div>
                <div style={{minWidth:0}}><div style={{fontWeight:600,fontSize:14,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{inv.name}</div><span style={G.chip(INV_CLR[inv.type]||'#64748b')}>{inv.type}</span></div>
              </div>
              <div style={{...G.row,gap:10,flexShrink:0}}>
                <button onClick={()=>openModal('investment',{...inv})} style={{background:'none',border:'none',fontSize:16,cursor:'pointer',padding:0}}>✏️</button>
                <button onClick={()=>setDel({type:'investment',id:inv.id,name:inv.name})} style={{background:'none',border:'none',fontSize:16,cursor:'pointer',padding:0}}>🗑️</button>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',background:'#f8fafc',borderRadius:10,padding:10,gap:4}}>
              <div><div style={{fontSize:10,color:'#64748b',marginBottom:2}}>Invested</div><div style={{fontWeight:700,fontSize:13}}>{INR(inv.invested)}</div></div>
              <div><div style={{fontSize:10,color:'#64748b',marginBottom:2}}>Current</div><div style={{fontWeight:700,fontSize:13}}>{INR(inv.current)}</div></div>
              <div><div style={{fontSize:10,color:'#64748b',marginBottom:2}}>Return</div><div style={{fontWeight:700,fontSize:13,color:pos?'#10b981':'#ef4444'}}>{pos?'+':''}{pct}%</div></div>
            </div>
            {inv.notes?<div style={{fontSize:11,color:'#94a3b8',marginTop:6}}>📝 {inv.notes}</div>:null}
          </div>
        );
      })}
      {investments.length===0&&<div style={{textAlign:'center',color:'#94a3b8',padding:'40px 0',fontSize:14}}>No investments yet. Add one!</div>}
    </div>
  );
}

function Goals({goals,openModal,setDel}){
  const totalTarget=goals.reduce((s,g)=>s+Number(g.target),0);
  const totalSaved=goals.reduce((s,g)=>s+Number(g.saved),0);
  return(
    <div style={{padding:16}}>
      <div style={{...G.row,justifyContent:'space-between',marginBottom:12}}>
        <div><div style={{fontSize:12,color:'#64748b'}}>Saved towards Goals</div><div style={{fontWeight:800,fontSize:20}}>{INR(totalSaved)} <span style={{fontSize:13,color:'#94a3b8',fontWeight:400}}>of {INR(totalTarget)}</span></div></div>
        <button style={G.btnSm} onClick={()=>openModal('goal',{})}>+ Add Goal</button>
      </div>
      {goals.map(g=>{
        const pct=Math.min(Number(g.saved)/Number(g.target)*100,100);
        const rem=Number(g.target)-Number(g.saved);
        const done=pct>=100;
        return(
          <div key={g.id} style={G.card}>
            <div style={{...G.row,justifyContent:'space-between',marginBottom:10}}>
              <div style={{fontWeight:700,fontSize:16}}>{g.name}</div>
              <div style={{...G.row,gap:10}}>
                <button onClick={()=>openModal('goal',{...g})} style={{background:'none',border:'none',fontSize:16,cursor:'pointer',padding:0}}>✏️</button>
                <button onClick={()=>setDel({type:'goal',id:g.id,name:g.name})} style={{background:'none',border:'none',fontSize:16,cursor:'pointer',padding:0}}>🗑️</button>
              </div>
            </div>
            <div style={{background:'#f1f5f9',borderRadius:50,height:12,marginBottom:8,overflow:'hidden'}}>
              <div style={{background:done?'#10b981':'linear-gradient(90deg,#4f46e5,#7c3aed)',height:'100%',width:`${pct}%`,borderRadius:50,transition:'width 0.4s'}}/>
            </div>
            <div style={{...G.row,justifyContent:'space-between',fontSize:13,marginBottom:4}}>
              <div><span style={{fontWeight:700,color:'#4f46e5'}}>{INR(g.saved)}</span> <span style={{color:'#94a3b8'}}>saved</span></div>
              <div style={{fontWeight:700,color:done?'#10b981':'#475569'}}>{pct.toFixed(0)}%</div>
              <div><span style={{color:'#94a3b8'}}>of </span><span style={{fontWeight:700}}>{INR(g.target)}</span></div>
            </div>
            {done?<div style={{fontSize:13,color:'#10b981',fontWeight:600}}>🎉 Goal Achieved!</div>:<div style={{fontSize:12,color:'#64748b'}}>Need {INR(rem)} more{g.date?` · Target: ${g.date}`:''}</div>}
          </div>
        );
      })}
      {goals.length===0&&<div style={{textAlign:'center',color:'#94a3b8',padding:'40px 0',fontSize:14}}>No goals yet. Set your first one!</div>}
    </div>
  );
}

function More({liabilities,snapshots,openModal,setDel,addSnapshot,exportCSV,netWorth,totalLiab}){
  return(
    <div style={{padding:16}}>
      <div style={{...G.row,justifyContent:'space-between',marginBottom:12}}>
        <div><div style={{fontWeight:700,fontSize:16}}>Liabilities & Loans</div><div style={{fontSize:12,color:'#94a3b8'}}>Total owed: {INR(totalLiab)}</div></div>
        <button style={G.btnSm} onClick={()=>openModal('liability',{type:'Home Loan'})}>+ Add</button>
      </div>
      {liabilities.map(l=>{
        const paidPct=Number(l.total)>0?((1-Number(l.remaining)/Number(l.total))*100):0;
        return(
          <div key={l.id} style={G.card}>
            <div style={{...G.row,justifyContent:'space-between',marginBottom:10}}>
              <div><div style={{fontWeight:600,fontSize:15}}>{l.name}</div><span style={G.chip('#ef4444')}>{l.type}</span></div>
              <div style={{...G.row,gap:10}}>
                <button onClick={()=>openModal('liability',{...l})} style={{background:'none',border:'none',fontSize:16,cursor:'pointer',padding:0}}>✏️</button>
                <button onClick={()=>setDel({type:'liability',id:l.id,name:l.name})} style={{background:'none',border:'none',fontSize:16,cursor:'pointer',padding:0}}>🗑️</button>
              </div>
            </div>
            <div style={{background:'#f1f5f9',borderRadius:50,height:8,marginBottom:10,overflow:'hidden'}}>
              <div style={{background:'#10b981',height:'100%',width:`${paidPct}%`,borderRadius:50}}/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:4}}>
              <div><div style={{fontSize:10,color:'#94a3b8'}}>Remaining</div><div style={{fontWeight:700,color:'#ef4444',fontSize:13}}>{INR(l.remaining)}</div></div>
              <div><div style={{fontSize:10,color:'#94a3b8'}}>Rate</div><div style={{fontWeight:700,fontSize:13}}>{l.rate}% p.a.</div></div>
              <div><div style={{fontSize:10,color:'#94a3b8'}}>EMI/mo</div><div style={{fontWeight:700,fontSize:13}}>{INR(l.emi)}</div></div>
            </div>
            <div style={{fontSize:11,color:'#94a3b8',marginTop:6}}>{paidPct.toFixed(0)}% paid off · Total: {INR(l.total)}</div>
          </div>
        );
      })}
      {liabilities.length===0&&<div style={{textAlign:'center',color:'#94a3b8',padding:'16px 0',fontSize:14}}>No liabilities. Debt-free! 🎉</div>}
      <div style={{...G.row,justifyContent:'space-between',marginTop:8,marginBottom:12}}>
        <div style={{fontWeight:700,fontSize:16}}>Monthly Snapshot</div>
        <button onClick={addSnapshot} style={{...G.btnSm,background:'#eef2ff',color:'#4f46e5'}}>+ Log Today</button>
      </div>
      <div style={G.card}>
        <div style={{fontSize:12,color:'#64748b',marginBottom:8}}>Current Net Worth: <b style={{color:'#4f46e5'}}>{INR(netWorth)}</b></div>
        {snapshots.length>=2?(
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={snapshots} margin={{top:5,right:10,left:-25,bottom:0}}>
              <XAxis dataKey="label" tick={{fontSize:10}}/>
              <YAxis tick={{fontSize:10}} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={v=>INR(v)} contentStyle={{borderRadius:8,fontSize:12}}/>
              <Line type="monotone" dataKey="nw" stroke="#4f46e5" strokeWidth={2.5} dot={{r:3,fill:'#4f46e5'}} name="Net Worth"/>
            </LineChart>
          </ResponsiveContainer>
        ):<div style={{textAlign:'center',color:'#94a3b8',padding:'20px 0',fontSize:13}}>Log at least 2 months to see trend</div>}
        <div style={{display:'flex',overflowX:'auto',gap:12,marginTop:8,paddingBottom:4}}>
          {snapshots.map((s,i)=>(
            <div key={i} style={{flexShrink:0,textAlign:'center',fontSize:11}}>
              <div style={{color:'#94a3b8'}}>{s.label}</div>
              <div style={{fontWeight:700,color:'#4f46e5'}}>₹{(s.nw/1000).toFixed(0)}k</div>
            </div>
          ))}
        </div>
      </div>
      <div style={G.card}>
        <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>📊 Export to Excel</div>
        <div style={{fontSize:13,color:'#64748b',marginBottom:14}}>Download all your data as CSV — opens in Excel or Google Sheets.</div>
        <button onClick={exportCSV} style={{...G.btn,width:'100%',textAlign:'center'}}>Download CSV / Excel File</button>
      </div>
    </div>
  );
}

export default function Page(){
  const [tab,setTab]           = useState('dashboard');
  const [accounts,setAccounts] = useState(DEMO.accounts);
  const [investments,setInv]   = useState(DEMO.investments);
  const [goals,setGoals]       = useState(DEMO.goals);
  const [liabilities,setLiab]  = useState(DEMO.liabilities);
  const [snapshots,setSnaps]   = useState(DEMO.snapshots);
  const [modal,setModal]       = useState(null);
  const [form,setForm]         = useState({});
  const [delItem,setDel]       = useState(null);
  const [isWide,setWide]       = useState(true);
  const [loaded,setLoaded]     = useState(false);

  useEffect(()=>{
    const update=()=>setWide(window.innerWidth>=768);
    update();
    window.addEventListener('resize',update);
    return()=>window.removeEventListener('resize',update);
  },[]);

  useEffect(()=>{
    (async()=>{
      try{
        const res = await fetch('/api/data');
        const d = await res.json();
        if(d.accounts) setAccounts(d.accounts);
        if(d.investments) setInv(d.investments);
        if(d.goals) setGoals(d.goals);
        if(d.liabilities) setLiab(d.liabilities);
        if(d.snapshots) setSnaps(d.snapshots);
      }catch{}finally{setLoaded(true);}
    })();
  },[]);

  useEffect(()=>{
    if(!loaded) return;
    (async()=>{
      try{
        await fetch('/api/data', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({accounts,investments,goals,liabilities,snapshots}),
        });
      }catch{}
    })();
  },[accounts,investments,goals,liabilities,snapshots,loaded]);

  const totalAccounts  = useMemo(()=>accounts.reduce((s,a)=>s+Number(a.balance),0),[accounts]);
  const totalInvested  = useMemo(()=>investments.reduce((s,i)=>s+Number(i.invested),0),[investments]);
  const totalPortfolio = useMemo(()=>investments.reduce((s,i)=>s+Number(i.current),0),[investments]);
  const totalLiab      = useMemo(()=>liabilities.reduce((s,l)=>s+Number(l.remaining),0),[liabilities]);
  const netWorth       = useMemo(()=>totalAccounts+totalPortfolio-totalLiab,[totalAccounts,totalPortfolio,totalLiab]);
  const totalGain      = useMemo(()=>totalPortfolio-totalInvested,[totalPortfolio,totalInvested]);
  const allocation     = useMemo(()=>{
    const g={};
    if(totalAccounts>0) g['Cash & Accounts']=totalAccounts;
    investments.forEach(i=>{g[i.type]=(g[i.type]||0)+Number(i.current);});
    return Object.entries(g).map(([name,value])=>({name,value}));
  },[totalAccounts,investments]);

  const ff=(k,v)=>setForm(p=>({...p,[k]:v}));
  const openModal=(type,data={})=>{setModal(type);setForm(data);};
  const closeModal=()=>{setModal(null);setForm({});};

  const saveAccount=()=>{
    if(!form.name||form.balance===''||form.balance===undefined) return;
    const item={...form,balance:Number(form.balance)};
    if(form.id) setAccounts(p=>p.map(a=>a.id===form.id?item:a));
    else setAccounts(p=>[...p,{...item,id:Date.now()}]);
    closeModal();
  };
  const saveInvestment=()=>{
    if(!form.name||!form.invested) return;
    const item={...form,invested:Number(form.invested),current:Number(form.current||form.invested)};
    if(form.id) setInv(p=>p.map(i=>i.id===form.id?item:i));
    else setInv(p=>[...p,{...item,id:Date.now()}]);
    closeModal();
  };
  const saveGoal=()=>{
    if(!form.name||!form.target) return;
    const item={...form,target:Number(form.target),saved:Number(form.saved||0)};
    if(form.id) setGoals(p=>p.map(g=>g.id===form.id?item:g));
    else setGoals(p=>[...p,{...item,id:Date.now()}]);
    closeModal();
  };
  const saveLiability=()=>{
    if(!form.name||!form.remaining) return;
    const item={...form,total:Number(form.total||form.remaining),remaining:Number(form.remaining),rate:Number(form.rate||0),emi:Number(form.emi||0)};
    if(form.id) setLiab(p=>p.map(l=>l.id===form.id?item:l));
    else setLiab(p=>[...p,{...item,id:Date.now()}]);
    closeModal();
  };
  const handleDelete=()=>{
    const{type,id}=delItem;
    if(type==='account') setAccounts(p=>p.filter(a=>a.id!==id));
    else if(type==='investment') setInv(p=>p.filter(i=>i.id!==id));
    else if(type==='goal') setGoals(p=>p.filter(g=>g.id!==id));
    else if(type==='liability') setLiab(p=>p.filter(l=>l.id!==id));
    setDel(null);
  };
  const addSnapshot=()=>{
    const m=new Date().toLocaleString('default',{month:'short'});
    setSnaps(p=>[...p,{label:`${m}'${String(new Date().getFullYear()).slice(2)}`,nw:netWorth}]);
  };
  const exportCSV=()=>{
    let c='PERSONAL FINANCE TRACKER\n\nACCOUNTS\nName,Type,Balance (INR)\n';
    accounts.forEach(a=>{c+=`${a.name},${a.type},${a.balance}\n`;});
    c+='\nINVESTMENTS\nName,Type,Invested,Current Value,Gain/Loss,Return %\n';
    investments.forEach(i=>{const g=Number(i.current)-Number(i.invested);c+=`${i.name},${i.type},${i.invested},${i.current},${g},${Number(i.invested)>0?(g/Number(i.invested)*100).toFixed(2)+'%':'N/A'}\n`;});
    c+='\nGOALS\nName,Target,Saved,Remaining,Progress %\n';
    goals.forEach(g=>{c+=`${g.name},${g.target},${g.saved},${g.target-g.saved},${(g.saved/g.target*100).toFixed(1)}%\n`;});
    c+='\nLIABILITIES\nName,Type,Total,Remaining,Rate,EMI\n';
    liabilities.forEach(l=>{c+=`${l.name},${l.type},${l.total},${l.remaining},${l.rate}%,${l.emi}\n`;});
    c+=`\nSUMMARY\nCash & Accounts,${totalAccounts}\nPortfolio,${totalPortfolio}\nLiabilities,${totalLiab}\nNet Worth,${netWorth}\n`;
    const blob=new Blob([c],{type:'text/csv;charset=utf-8;'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`fintrack_${new Date().toISOString().slice(0,10)}.csv`;a.click();
    URL.revokeObjectURL(url);
  };

  const NAV=[{id:'dashboard',icon:'📊',label:'Home'},{id:'accounts',icon:'🏦',label:'Accounts'},{id:'investments',icon:'📈',label:'Invest'},{id:'goals',icon:'🎯',label:'Goals'},{id:'more',icon:'☰',label:'More'}];
  const onSave=modal==='account'?saveAccount:modal==='investment'?saveInvestment:modal==='goal'?saveGoal:saveLiability;

  return(
    <div style={{display:'flex',minHeight:'100vh',background:'#eef2ff',fontFamily:'system-ui,-apple-system,BlinkMacSystemFont,sans-serif'}}>
      {isWide&&(
        <aside style={{width:220,background:'#fff',borderRight:'1px solid #e2e8f0',display:'flex',flexDirection:'column',position:'fixed',top:0,bottom:0,left:0,zIndex:10}}>
          <div style={{padding:'22px 20px',borderBottom:'1px solid #e2e8f0'}}>
            <div style={{fontSize:20,fontWeight:800,color:'#4f46e5'}}>💰 FinTrack</div>
            <div style={{fontSize:11,color:'#94a3b8',marginTop:2}}>Personal Finance Tracker</div>
          </div>
          <nav style={{flex:1,padding:'12px 10px',overflowY:'auto'}}>
            {NAV.map(n=>(
              <button key={n.id} onClick={()=>setTab(n.id)} style={{display:'flex',alignItems:'center',width:'100%',padding:'11px 14px',borderRadius:10,border:'none',cursor:'pointer',marginBottom:4,background:tab===n.id?'#eef2ff':'transparent',color:tab===n.id?'#4f46e5':'#475569',fontWeight:tab===n.id?700:400,fontSize:14}}>
                <span style={{fontSize:18,marginRight:12}}>{n.icon}</span>{n.label}
              </button>
            ))}
          </nav>
          <div style={{padding:'14px 16px',borderTop:'1px solid #e2e8f0',textAlign:'center'}}>
            <div style={{fontSize:11,color:'#94a3b8'}}>Net Worth</div>
            <div style={{fontWeight:800,color:'#4f46e5',fontSize:17}}>{INR(netWorth)}</div>
          </div>
        </aside>
      )}
      <main style={{flex:1,marginLeft:isWide?220:0,paddingBottom:isWide?0:84,overflowY:'auto',maxHeight:'100vh'}}>
        {!isWide&&(
          <div style={{background:'#fff',borderBottom:'1px solid #e2e8f0',padding:'13px 16px',position:'sticky',top:0,zIndex:5,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{fontWeight:800,fontSize:18,color:'#4f46e5'}}>💰 FinTrack</div>
            <div style={{fontSize:12,color:'#64748b'}}>NW: <b style={{color:'#4f46e5'}}>{INR(netWorth)}</b></div>
          </div>
        )}
        {tab==='dashboard'   &&<Dashboard {...{netWorth,totalAccounts,totalPortfolio,totalLiab,totalGain,totalInvested,allocation,snapshots,goals}}/>}
        {tab==='accounts'    &&<Accounts {...{accounts,openModal,setDel}}/>}
        {tab==='investments' &&<Investments {...{investments,openModal,setDel,totalInvested,totalPortfolio,totalGain}}/>}
        {tab==='goals'       &&<Goals {...{goals,openModal,setDel}}/>}
        {tab==='more'        &&<More {...{liabilities,snapshots,openModal,setDel,addSnapshot,exportCSV,netWorth,totalLiab}}/>}
      </main>
      {!isWide&&(
        <nav style={{position:'fixed',bottom:0,left:0,right:0,background:'#fff',borderTop:'1px solid #e2e8f0',display:'flex',zIndex:10}}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setTab(n.id)} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',padding:'10px 0 8px',border:'none',background:'transparent',cursor:'pointer',color:tab===n.id?'#4f46e5':'#94a3b8'}}>
              <span style={{fontSize:22}}>{n.icon}</span>
              <span style={{fontSize:10,marginTop:2,fontWeight:tab===n.id?700:400}}>{n.label}</span>
            </button>
          ))}
        </nav>
      )}
      {modal&&<Modal type={modal} form={form} ff={ff} onSave={onSave} onClose={closeModal}/>}
      {delItem&&(
        <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.6)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'#fff',borderRadius:18,padding:24,maxWidth:320,width:'100%',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
            <div style={{fontSize:40,textAlign:'center',marginBottom:12}}>🗑️</div>
            <div style={{fontWeight:700,fontSize:18,textAlign:'center',marginBottom:8}}>Delete "{delItem.name}"?</div>
            <div style={{color:'#64748b',fontSize:14,textAlign:'center',marginBottom:24}}>This action cannot be undone.</div>
            <div style={{display:'flex',gap:12}}>
              <button onClick={()=>setDel(null)} style={{...G.btnOut,flex:1}}>Cancel</button>
              <button onClick={handleDelete} style={{...G.btnRed,flex:1}}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
