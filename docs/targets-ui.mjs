import {TARGET_PERIODS,TARGET_KINDS,TARGET_DATE_START,TARGET_DATE_END,TARGET_RECORD_TYPES,TARGET_COLORS,TARGET_TYPE_COLORS,flattenTargets,targetsView,setTargetDate,formatTargetMetric,targetMetricTone,targetPerformance,targetPeriods,targetLabel} from './targets-model.mjs?v=81';
import {attachTargetColumnResizer} from './target-column-width.mjs?v=80';

const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
const control=(text,label,handler)=>{const button=el('button','',text);button.type='button';button.setAttribute('aria-label',label);button.addEventListener('click',handler);return button;};
const typeLabels={total:'TOTAL',portfolio:'PORTFOLIO',campaign:'CAMPAIGN',group:'AD GROUP',keyword:'KEYWORD',asin:'ASIN TARGET',term:'SEARCH TERM',asinTerm:'ASIN MATCH',auto:'AUTO TARGET',autoTerm:'AUTO MATCH',category:'CATEGORY',categoryTerm:'ASIN MATCH'};

export function createTargetsUI({state,getStatus,getView=()=>'Targets',onKind}){
  const root=el('section','targets-workspace');root.setAttribute('aria-labelledby','targets-title');
  const title=el('h1','workspace-sr-only','TARGETS');title.id='targets-title';root.append(title);
  const controls=el('div','targets-controls');root.append(controls);
  const toolbar=el('div','targets-toolbar'),kindBar=el('div','targets-kind');kindBar.setAttribute('role','group');kindBar.setAttribute('aria-label','Target type');
  const kindButtons=TARGET_KINDS.map(kind=>{
    const button=control(kind==='Categories'?'CATEGORY':kind.toUpperCase(),`Show ${kind==='All'?'all targets':kind.toLowerCase()}`,()=>{
      state.kind=kind;onKind(kind);render();tableWrap.scrollTop=0;
    });button.dataset.targetKind=kind;kindBar.append(button);return button;
  });
  const search=el('input','targets-search');search.type='search';search.placeholder='Find keyword, ASIN, campaign, portfolio…';search.setAttribute('aria-label','Search targets');
  search.addEventListener('input',()=>{state.query=search.value;renderTable();tableWrap.scrollTop=0;});
  toolbar.append(kindBar,search);controls.append(toolbar);
  const periodRow=el('div','targets-period-row'),periodBar=el('div','targets-periods');periodBar.setAttribute('role','group');periodBar.setAttribute('aria-label','Performance period');
  const periodButtons=TARGET_PERIODS.map(period=>{
    const button=control(period==='ALL'?'ALL PERIODS':period,`Show ${period==='ALL'?'all periods':period}`,()=>{
      state.period=period;render();tableWrap.scrollLeft=0;
    });button.dataset.targetPeriod=period;periodBar.append(button);return button;
  });
  periodRow.append(periodBar);controls.append(periodRow);
  const dates=el('div','targets-dates'),dateInputs={};
  for(const [key,label] of [['rangeStart','From'],['rangeEnd','To'],['date','Date']]){
    const wrapper=el('label','',label),input=el('input');input.type='date';input.min=TARGET_DATE_START;input.max=TARGET_DATE_END;
    input.setAttribute('aria-label',`Targets ${key==='date'?'selected':label.toLowerCase()} date`);input.value=state[key];dateInputs[key]=input;
    input.addEventListener('change',()=>{
      if(!setTargetDate(state,key,input.value)){
        input.value=state[key];dateError.textContent=`Choose dates from ${TARGET_DATE_START} to ${TARGET_DATE_END}, with From before To.`;return;
      }
      dateError.textContent='';renderTable();
    });wrapper.append(input);dates.append(wrapper);
  }
  const dateError=el('p','targets-date-error');dateError.setAttribute('role','alert');controls.append(dates,dateError);
  const summary=el('p','targets-summary workspace-sr-only');summary.setAttribute('role','status');summary.setAttribute('aria-live','polite');root.append(summary);
  const gridArea=el('div','targets-grid-area');
  const tableWrap=el('div','targets-scroll');tableWrap.tabIndex=0;tableWrap.setAttribute('role','region');tableWrap.setAttribute('aria-label','Targets table, scroll for more metrics');
  const table=el('table','targets-table');table.id='targets-table';table.append(el('caption','workspace-sr-only','Standalone records with one filtered totals row. Each total counts matching search terms once.'));
  const thead=el('thead'),tbody=el('tbody');table.append(thead,tbody);tableWrap.append(table);
  const handle=el('div','target-column-resizer');handle.tabIndex=0;handle.setAttribute('role','separator');handle.setAttribute('aria-orientation','vertical');
  handle.setAttribute('aria-label','Resize frozen target column');handle.setAttribute('aria-controls','targets-table');handle.setAttribute('aria-describedby','target-resize-help');
  handle.title='Drag to resize target column. Double-click to reset.';const grip=el('span','target-resize-grip','↔');grip.setAttribute('aria-hidden','true');handle.append(grip);
  const resizeHelp=el('span','workspace-sr-only','Drag the right edge to resize. Arrow keys adjust width; Home resets to the default.');resizeHelp.id='target-resize-help';
  gridArea.append(tableWrap,handle);root.append(gridArea,resizeHelp);
  const columnResizer=attachTargetColumnResizer({root,viewport:tableWrap,handle,state});
  const empty=el('p','targets-empty','No records match. Clear the search or change a filter.');empty.hidden=true;root.append(empty);

  const dialog=el('dialog','action-detail target-detail');dialog.id='target-detail';dialog.setAttribute('aria-labelledby','target-detail-title');dialog.setAttribute('aria-describedby','target-detail-note');
  const dialogHeader=el('div','action-detail-header'),dialogTitle=el('h2');dialogTitle.id='target-detail-title';
  let opener=null;
  const finish=()=>{(opener?.isConnected?opener:tableWrap).focus({preventScroll:true});opener=null;};
  const close=()=>{if(typeof dialog.close==='function')dialog.close();else{dialog.removeAttribute('open');finish();}};
  const closeButton=control('CLOSE','Close target details',close);closeButton.className='action-detail-close';dialogHeader.append(dialogTitle,closeButton);
  const dialogBody=el('div','action-detail-body');dialog.append(dialogHeader,dialogBody);document.body.append(dialog);
  dialog.addEventListener('close',finish);dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  dialog.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();close();}
    if(event.key==='Tab'){event.preventDefault();closeButton.focus({preventScroll:true});}
  });
  function openDetails(row,button){
    opener=button;dialogTitle.textContent=`${typeLabels[row.type]} · ${row.name}`;
    const note=el('p','action-detail-notice','Illustrative Targets example. These figures and ASINs are fictional; no live advertising account is connected.');note.id='target-detail-note';
    const context=el('dl','target-detail-fields');
    const fields=[['Record type',TARGET_RECORD_TYPES[row.type]],['Name',row.name],['Keyword / target',row.target||'—'],
      ['Portfolio',row.portfolio],['Ad type',row.adType],['ASIN / SKU',row.sku],['Campaign',row.campaign],[row.type==='portfolio'?'Combined campaign budgets':'Campaign budget',formatTargetMetric({format:'money'},row.budget)],
      ['Ad group',row.group||'—'],['Match type',row.match||'—'],['Status',row.status],['Bid',row.bid===undefined?'—':formatTargetMetric({format:'money'},row.bid)],['Target ACoS','30.0%']];
    for(const [label,value] of fields)context.append(el('dt','',label),el('dd','',value||'—'));
    dialogBody.replaceChildren(note,context);
    if(['keyword','asin','auto','category'].includes(row.type)){
      const section=el('section','target-detail-period');section.append(el('h3','','Matching search terms'));
      const list=el('ul','target-detail-terms');
      flattenTargets([row]).filter(n=>!n.children.length).forEach(term=>list.append(el('li','',term.name)));
      section.append(list);dialogBody.append(section);
    }
    for(const period of targetPeriods(state)){
      const metrics=targetPerformance(row,period),group=el('section','target-detail-period');group.append(el('h3','',period.label));
      const list=el('dl','target-detail-fields');
      for(const metric of period.metrics)list.append(el('dt','',metric.label),el('dd','',formatTargetMetric(metric,metrics[metric.key])));
      list.append(el('dt','','ROAS'),el('dd','',metrics.roas===null?'—':metrics.roas.toFixed(2)+'×'));group.append(list);dialogBody.append(group);
    }
    dialogBody.append(el('p','action-detail-notice','TACoS is unavailable because this example does not attribute total product sales to individual targets. Totals are recalculated from matching search terms once. Ratios use the summed values. Filters also apply to Campaigns and Portfolios.'));
    if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');closeButton.focus({preventScroll:true});
  }
  function renderTable(){
    const view=targetsView(state,getStatus(),getView()),topRow=el('tr','targets-group-heading'),headerRow=el('tr','targets-column-heading');
    title.textContent=view.title;tableWrap.setAttribute('aria-label',`${view.title.toLowerCase()} table, scroll for more metrics`);
    const identity=[view.headers[0].toUpperCase(),'TYPE'];
    identity.forEach((label,i)=>{const th=el('th',i===0?'target-frozen':'target-search-cell',label);th.rowSpan=2;th.scope='col';topRow.append(th);});
    for(const period of view.periods){
      const th=el('th','target-period-heading','PERFORMANCE');th.colSpan=period.metrics.length;th.scope='colgroup';topRow.append(th);
      for(const metric of period.metrics){const th=el('th','target-metric-heading',`${period.key}_${metric.label}`);th.scope='col';th.dataset.metric=metric.key;th.dataset.period=period.key;
        if(metric.key==='tacos')th.title='Total sales attribution is not available for this target example.';headerRow.append(th);}
    }
    const contextHead=el('th','target-period-heading','CONTEXT');contextHead.colSpan=7;contextHead.scope='colgroup';topRow.append(contextHead);
    for(const label of ['RECORD TYPE','MATCH','STATUS','BID','ASIN / SKU','CAMPAIGN','AD GROUP']){const th=el('th','',label);th.scope='col';headerRow.append(th);}
    thead.replaceChildren(topRow,headerRow);
    const fragment=document.createDocumentFragment();
    for(const row of [view.totalRecord,...view.targetRecords]){
      const tr=el('tr',`${row.type==='total'?'target-totals':'target-row'} target-row-${row.type}`);tr.dataset.targetId=row.id;tr.dataset.recordType=TARGET_RECORD_TYPES[row.type];
      const nameCell=el('th','target-frozen');nameCell.scope='row';
      const nameWrap=el('div','target-name-content');
      const label=el('span','target-name',targetLabel(row));label.title=targetLabel(row);
      const info=control('',`View ${typeLabels[row.type].toLowerCase()} details for ${row.name}`,()=>openDetails(row,info));info.className='target-info';info.dataset.targetInfo=row.id;
      info.setAttribute('aria-haspopup','dialog');info.setAttribute('aria-controls','target-detail');
      info.style.color=TARGET_TYPE_COLORS[row.type];
      const svgNS='http://www.w3.org/2000/svg',icon=document.createElementNS(svgNS,'svg');icon.setAttribute('viewBox','0 0 1024 1024');icon.setAttribute('aria-hidden','true');
      for(const [tag,attributes] of [['circle',{cx:512,cy:512,r:480,fill:'#000000',stroke:'currentColor','stroke-width':32}],['circle',{cx:512,cy:288,r:54,fill:'currentColor'}],['rect',{x:458,y:414,width:108,height:376,rx:54,fill:'currentColor'}]]){
        const shape=document.createElementNS(svgNS,tag);Object.entries(attributes).forEach(([key,value])=>shape.setAttribute(key,String(value)));icon.append(shape);
      }
      info.append(icon);
      nameWrap.append(info,label);nameCell.append(nameWrap);tr.append(nameCell);
      const searchCell=el('td','target-search-cell'),searchWrap=el('div','target-search-content');
      const detailText=row.type==='total'?`${view.targetRecords.length} ${getView().toUpperCase()}`:`${typeLabels[row.type]}${row.type==='keyword'?' · '+row.match:''}`;
      const detail=el('span','target-search-label',detailText);detail.title=detailText;searchWrap.append(detail);
      searchCell.append(searchWrap);tr.append(searchCell);
      view.periods.forEach((period,index)=>{
        for(const metric of period.metrics){
          const value=row.performance[index][metric.key],cell=el('td','target-metric',formatTargetMetric(metric,value));
          cell.dataset.period=period.key;cell.dataset.metric=metric.key;
          const tone=targetMetricTone(metric,value,row);
          if(tone){cell.style.backgroundColor=TARGET_COLORS[tone];cell.dataset.tone=tone;}
          if(metric.key==='tacos')cell.title='Unavailable: total product sales are not attributed to individual targets.';tr.append(cell);
        }
      });
      for(const value of [TARGET_RECORD_TYPES[row.type],row.match||'—',row.status,row.bid===undefined?'—':formatTargetMetric({format:'money'},row.bid),row.sku||'—',row.campaign||'—',row.group||'—']){
        const cell=el('td','target-context',value);cell.title=value;tr.append(cell);
      }
      fragment.append(tr);
    }
    tbody.replaceChildren(fragment);empty.hidden=Boolean(view.targetRecords.length);tableWrap.hidden=false;gridArea.hidden=false;handle.hidden=false;columnResizer.refresh();
    const c=view.counts;summary.textContent=`${view.targetRecords.length} standalone ${getView().toLowerCase()} · one filtered total · ${c.campaigns} campaigns · ${c.groups} ad groups · ${c.keywords} keywords · ${c.asins} ASINs · ${c.auto} auto · ${c.categories} categories · ${c.terms} search terms${getStatus()==='All'?'':` · ${getStatus()}`}`;
    return view;
  }
  function render(){
    kindButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.targetKind===state.kind)));
    periodButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.targetPeriod===state.period)));
    search.value=state.query;dates.hidden=!['RANGE','DATE','ALL'].includes(state.period);dateError.textContent='';
    for(const [key,input] of Object.entries(dateInputs)){input.value=state[key];input.parentElement.hidden=key==='date'?!['DATE','ALL'].includes(state.period):!['RANGE','ALL'].includes(state.period);}
    renderTable();
  }
  return {root,render,tableWrap,controls};
}
