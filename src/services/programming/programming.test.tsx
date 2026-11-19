import {describe,it,expect,vi} from 'vitest';
import {render} from '@testing-library/react';
import {programmingSnapshotSchema} from './programming-contract';
import {currentProgramming,ProgrammingProvider} from './ProgrammingProvider';
const programId='11111111-1111-4111-8111-111111111111',slotId='22222222-2222-4222-8222-222222222222';
const snapshot=programmingSnapshotSchema.parse({schemaVersion:1,radioKey:'radio-88',namespace:'preview/radio-88',revision:1,generatedAt:'2026-01-01T00:00:00.000Z',validUntil:'2099-01-01T00:00:00.000Z',timezone:'America/Sao_Paulo',programs:[{id:programId,name:'Programa local',slug:'programa-local',description:'Teste',presenters:['Locutor público'],imageUrl:null}],slots:[{id:slotId,programId,weekday:1,startMinute:300,endMinute:570,validFrom:'2026-01-01',validUntil:null}],exceptions:[]});
describe('No Ar shared context',()=>{
 it.each([['2026-11-09T07:59:59Z',false],['2026-11-09T08:00:00Z',true],['2026-11-09T12:29:59Z',true],['2026-11-09T12:30:00Z',false]])('resolves the correct boundary %s',(at,active)=>expect(!!currentProgramming(snapshot,Date.parse(at))).toBe(active));
 it('uses declared public presenter names',()=>expect(currentProgramming(snapshot,Date.parse('2026-11-09T09:00:00Z'))?.presenters).toEqual(['Locutor público']));
 it('clears an expired snapshot',()=>expect(currentProgramming({...snapshot,validUntil:'2026-11-08T00:00:00Z'},Date.parse('2026-11-09T09:00:00Z'))).toBeNull());
 it('honors an explicit interruption',()=>expect(currentProgramming({...snapshot,exceptions:[{id:slotId,programId:null,startsAt:'2026-11-09T08:30:00Z',endsAt:'2026-11-09T09:30:00Z'}]},Date.parse('2026-11-09T09:00:00Z'))).toBeNull());
 it('does not request data when the feature is disabled by default',()=>{
  const fetch=vi.spyOn(globalThis,'fetch');render(<ProgrammingProvider><p>Ouvindo</p></ProgrammingProvider>);expect(fetch).not.toHaveBeenCalled();
 });
});
