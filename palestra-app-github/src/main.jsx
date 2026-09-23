import React, {useEffect, useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import {Dumbbell, Home, History, BarChart3, Settings, Plus, Check, ChevronRight, Timer, Trophy, Scale, Trash2} from "lucide-react";
import "./styles.css";

const initialWorkouts = [
  {id:"A", name:"Petto • Spalle • Tricipiti", exercises:[
    {id:"bench",name:"Panca piana", target:"4 × 6–8", sets:[]},
    {id:"incline",name:"Panca inclinata", target:"3 × 8–10", sets:[]},
    {id:"lateral",name:"Alzate laterali", target:"3 × 10–15", sets:[]},
    {id:"shoulder",name:"Shoulder press", target:"3 × 8–10", sets:[]},
    {id:"pushdown",name:"Pushdown tricipiti", target:"3 × 10–12", sets:[]}
  ]},
  {id:"B", name:"Schiena • Bicipiti", exercises:[
    {id:"lat",name:"Lat machine", target:"4 × 8–10", sets:[]},
    {id:"row",name:"Rematore", target:"3 × 8–10", sets:[]},
    {id:"pulley",name:"Pulley", target:"3 × 10–12", sets:[]},
    {id:"curl",name:"Curl bilanciere", target:"3 × 8–12", sets:[]},
    {id:"hammer",name:"Curl manubri", target:"3 × 10–12", sets:[]}
  ]}
];

function App(){
  const [tab,setTab]=useState("home");
  const [workouts,setWorkouts]=useState(()=>JSON.parse(localStorage.getItem("gym-workouts")||"null")||initialWorkouts);
  const [active,setActive]=useState(null);
  const [weight,setWeight]=useState(()=>localStorage.getItem("gym-weight")||"74");
  const [timer,setTimer]=useState(0);

  useEffect(()=>localStorage.setItem("gym-workouts",JSON.stringify(workouts)),[workouts]);
  useEffect(()=>localStorage.setItem("gym-weight",weight),[weight]);
  useEffect(()=>{if(!timer)return; const t=setInterval(()=>setTimer(v=>v>0?v-1:0),1000); return()=>clearInterval(t)},[timer]);

  const totalSets=useMemo(()=>workouts.reduce((n,w)=>n+w.exercises.reduce((a,e)=>a+e.sets.length,0),0),[workouts]);

  function startWorkout(w){
    setActive(w.id);
    setTab("workout");
  }
  function addSet(workoutId, exerciseId){
    setWorkouts(ws=>ws.map(w=>w.id!==workoutId?w:{...w,exercises:w.exercises.map(e=>e.id!==exerciseId?e:{...e,sets:[...e.sets,{kg:"",reps:""}]})}));
  }
  function updateSet(wid,eid,idx,key,val){
    setWorkouts(ws=>ws.map(w=>w.id!==wid?w:{...w,exercises:w.exercises.map(e=>{
      if(e.id!==eid)return e;
      const sets=e.sets.map((s,i)=>i===idx?{...s,[key]:val}:s);
      return {...e,sets};
    })}));
  }
  function finish(){
    setTab("home"); setActive(null);
  }

  return <div className="app">
    <header className="topbar">
      <div><div className="eyebrow">MY FITNESS</div><h1>Palestra</h1></div>
      <div className="avatar">F</div>
    </header>

    <main>
      {tab==="home" && <HomeScreen weight={weight} setWeight={setWeight} workouts={workouts} startWorkout={startWorkout} totalSets={totalSets}/>}
      {tab==="workout" && <WorkoutScreen workout={workouts.find(w=>w.id===active)} addSet={addSet} updateSet={updateSet} finish={finish} timer={timer} setTimer={setTimer}/>}
      {tab==="history" && <HistoryScreen workouts={workouts}/>}
      {tab==="stats" && <StatsScreen workouts={workouts} weight={weight}/>}
      {tab==="settings" && <SettingsScreen onReset={()=>{localStorage.clear();location.reload()}}/>}
    </main>

    <nav className="nav">
      {[
        ["home",Home,"Home"],["history",History,"Storico"],["stats",BarChart3,"Progressi"],["settings",Settings,"Altro"]
      ].map(([id,Icon,label])=><button key={id} className={tab===id?"navbtn active":"navbtn"} onClick={()=>setTab(id)}><Icon size={21}/><span>{label}</span></button>)}
    </nav>
  </div>
}

function HomeScreen({weight,setWeight,workouts,startWorkout,totalSets}){
  return <section className="screen">
    <div className="welcome"><span>Pronto?</span><strong>È ora di spingere.</strong></div>
    <div className="statsgrid">
      <div className="card metric"><Scale size={20}/><small>Peso</small><b>{weight} kg</b></div>
      <div className="card metric"><Dumbbell size={20}/><small>Serie registrate</small><b>{totalSets}</b></div>
      <div className="card metric"><Trophy size={20}/><small>Obiettivo</small><b>72 kg</b></div>
    </div>
    <div className="sectiontitle"><h2>Allenamenti</h2><span>2 schede</span></div>
    <div className="workoutlist">
      {workouts.map(w=><button className="workoutcard" key={w.id} onClick={()=>startWorkout(w)}>
        <div className="workouticon">{w.id}</div>
        <div className="grow"><small>SESSIONE {w.id}</small><h3>{w.name}</h3><p>{w.exercises.length} esercizi</p></div>
        <ChevronRight/>
      </button>)}
    </div>
    <div className="card weightcard">
      <div><small>PESO CORPOREO</small><h3>{weight} kg</h3></div>
      <input aria-label="Peso corporeo" type="number" step="0.1" value={weight} onChange={e=>setWeight(e.target.value)}/>
    </div>
  </section>
}

function WorkoutScreen({workout,addSet,updateSet,finish,timer,setTimer}){
  if(!workout)return <section className="screen"><div className="empty">Seleziona un allenamento.</div></section>;
  return <section className="screen">
    <button className="back" onClick={finish}>← Torna alla home</button>
    <div className="workouthead"><div><small>SESSIONE {workout.id}</small><h2>{workout.name}</h2></div><button className="timerbtn" onClick={()=>setTimer(timer?0:90)}><Timer size={18}/>{timer?`${Math.floor(timer/60)}:${String(timer%60).padStart(2,"0")}`:"Timer"}</button></div>
    {workout.exercises.map(e=><div className="exercise card" key={e.id}>
      <div className="exhead"><div><h3>{e.name}</h3><small>Target: {e.target}</small></div><span>{e.sets.length} serie</span></div>
      {e.sets.map((s,i)=><div className="setrow" key={i}><b>{i+1}</b><input inputMode="decimal" placeholder="kg" value={s.kg} onChange={x=>updateSet(workout.id,e.id,i,"kg",x.target.value)}/><span>×</span><input inputMode="numeric" placeholder="reps" value={s.reps} onChange={x=>updateSet(workout.id,e.id,i,"reps",x.target.value)}/><button className="check"><Check size={17}/></button></div>)}
      <button className="addset" onClick={()=>addSet(workout.id,e.id)}><Plus size={17}/> Aggiungi serie</button>
    </div>)}
    <button className="finish" onClick={finish}>Termina allenamento <Check/></button>
  </section>
}

function HistoryScreen({workouts}){
  const entries=workouts.flatMap(w=>w.exercises.flatMap(e=>e.sets.filter(s=>s.kg||s.reps).map((s,i)=>({w,e,s,i}))));
  return <section className="screen"><div className="pagehead"><small>ATTIVITÀ</small><h2>Storico</h2></div>
    {entries.length===0?<div className="card empty"><History/><p>Ancora nessun dato.<br/>Registra la prima serie!</p></div>:
    <div className="card history">{entries.map((x,i)=><div className="historyrow" key={i}><div><b>{x.e.name}</b><small>Sessione {x.w.id} • Serie {x.i+1}</small></div><strong>{x.s.kg||"—"} kg × {x.s.reps||"—"}</strong></div>)}</div>}
  </section>
}

function StatsScreen({workouts,weight}){
  const values=workouts.flatMap(w=>w.exercises.flatMap(e=>e.sets.map(s=>Number(s.kg)).filter(Boolean)));
  const max=values.length?Math.max(...values):0;
  return <section className="screen"><div className="pagehead"><small>DATI</small><h2>Progressi</h2></div>
    <div className="statsbig card"><BarChart3/><div><small>CARICO MASSIMO REGISTRATO</small><strong>{max} kg</strong></div></div>
    <div className="card"><div className="sectiontitle"><h3>Peso</h3><b>{weight} kg</b></div><div className="fakechart"><div style={{height:"35%"}}/><div style={{height:"48%"}}/><div style={{height:"43%"}}/><div style={{height:"65%"}}/><div style={{height:"78%"}}/></div></div>
  </section>
}

function SettingsScreen({onReset}){
  return <section className="screen"><div className="pagehead"><small>APP</small><h2>Impostazioni</h2></div>
    <div className="card settings"><div><b>Dati locali</b><p>I dati vengono salvati sul dispositivo.</p></div><button className="danger" onClick={onReset}><Trash2 size={17}/> Cancella dati</button></div>
    <div className="card"><b>Palestra v1.0</b><p>Web app mobile pronta per essere pubblicata su GitHub Pages.</p></div>
  </section>
}

createRoot(document.getElementById("root")).render(<App/>);