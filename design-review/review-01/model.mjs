export function fixtures() {
  return [
    {id:'tan', name:'Tan Family', table:'08', email:'Accepted, not delivered', seats:[
      {id:'a',name:'Alex Tan',rsvp:'attending',arrived:true},
      {id:'b',name:'Jamie Tan',rsvp:'attending',arrived:false},
      {id:'c',name:'Reserved place 3',rsvp:'attending',arrived:false},
      {id:'d',name:'Reserved place 4',rsvp:'declined',arrived:false}]},
    {id:'lee',name:'Morgan Lee & guest',table:'Unassigned',email:'Not sent',seats:[
      {id:'e',name:'Morgan Lee',rsvp:'pending',arrived:false},
      {id:'f',name:'Reserved place 2',rsvp:'pending',arrived:false}]}];
}
export function totals(parties) {
  const seats=parties.flatMap(p=>p.seats);
  return {invited:seats.filter(s=>!s.extra).length, extras:seats.filter(s=>s.extra).length,
    attending:seats.filter(s=>s.rsvp==='attending').length,
    pending:seats.filter(s=>s.rsvp==='pending').length,
    declined:seats.filter(s=>s.rsvp==='declined').length,arrived:seats.filter(s=>s.arrived).length};
}
export function arrive(party, ids) {
  const changed=party.seats.filter(s=>ids.includes(s.id)&&s.rsvp==='attending'&&!s.arrived);
  changed.forEach(s=>{s.arrived=true;});
  return changed.map(s=>s.id);
}
export function undo(party, ids) {party.seats.filter(s=>ids.includes(s.id)).forEach(s=>{s.arrived=false;});}
