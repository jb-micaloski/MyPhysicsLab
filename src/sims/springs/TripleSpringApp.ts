// Copyright 2026.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { AbstractApp } from '../common/AbstractApp.js';
import { ButtonControl } from '../../lab/controls/ButtonControl.js';
import { CommonControls } from '../common/CommonControls.js';
import { DisplayShape } from '../../lab/view/DisplayShape.js';
import { DisplaySpring } from '../../lab/view/DisplaySpring.js';
import { DoubleRect } from '../../lab/util/DoubleRect.js';
import { ElementIDs } from '../common/Layout.js';
import { EnergyInfo } from '../../lab/model/EnergySystem.js';
import { NumericControl } from '../../lab/controls/NumericControl.js';
import { ParameterNumber, Subject, SubjectList } from '../../lab/util/Observe.js';
import { SimpleAdvance } from '../../lab/model/SimpleAdvance.js';
import { SliderControl } from '../../lab/controls/SliderControl.js';
import { TripleSpringSim } from './TripleSpringSim.js';
import { Util } from '../../lab/util/Util.js';

/** Displays the {@link TripleSpringSim} simulation. */
export class TripleSpringApp extends AbstractApp<TripleSpringSim> implements
    Subject, SubjectList {

  anchors: DisplayShape[] = [];
  bob: DisplayShape;
  springs: DisplaySpring[] = [];

/**
* @param elem_ids specifies the names of the HTML elementId's to look for.
*/
constructor(elem_ids: ElementIDs) {
  Util.setErrorHandler();
  const simRect = new DoubleRect(-4.5, -4.0, 4.5, 4.5);
  const sim = new TripleSpringSim();
  const advance = new SimpleAdvance(sim);
  super(elem_ids, simRect, sim, advance, /*eventHandler=*/sim,
      /*energySystem=*/sim);
  this.layout.getSimCanvas().setBackground('black');
  this.layout.getSimCanvas().setAlpha(CommonControls.SHORT_TRAILS);

  ['anchor1', 'anchor2', 'anchor3'].forEach(name => {
    const anchor = new DisplayShape(this.simList.getPointMass(name));
    anchor.setFillStyle('#f08030');
    anchor.setStrokeStyle('#d9edf0');
    anchor.setThickness(3);
    this.anchors.push(anchor);
    this.displayList.add(anchor);
  });
  this.bob = new DisplayShape(this.simList.getPointMass('bob'));
  this.bob.setFillStyle('#70a8c4');
  this.bob.setStrokeStyle('#ffffff');
  this.bob.setThickness(3);
  this.displayList.add(this.bob);
  ['spring1', 'spring2', 'spring3'].forEach(name => {
    const spring = new DisplaySpring(this.simList.getSpring(name));
    spring.setWidth(0.26);
    spring.setThickness(3);
    spring.setColorCompressed('#f08030');
    spring.setColorExpanded('#70d0c0');
    this.springs.push(spring);
    this.displayList.add(spring);
  });
  sim.saveInitialState();

  this.addPlaybackControls();
  let pn: ParameterNumber;
  pn = sim.getParameterNumber(TripleSpringSim.en.GRAVITY);
  this.addControl(new SliderControl(pn, 0, 8, /*multiply=*/false));
  pn = sim.getParameterNumber(TripleSpringSim.en.MASS);
  this.addControl(new SliderControl(pn, 0.2, 10, /*multiply=*/true));
  pn = sim.getParameterNumber(TripleSpringSim.en.DAMPING);
  this.addControl(new SliderControl(pn, 0, 2, /*multiply=*/false));
  pn = sim.getParameterNumber(TripleSpringSim.en.ANCHOR_RADIUS);
  this.addControl(new SliderControl(pn, 1.5, 5, /*multiply=*/false));
  pn = sim.getParameterNumber(TripleSpringSim.en.SPRING_LENGTH);
  this.addControl(new SliderControl(pn, 0.5, 5, /*multiply=*/false));
  pn = sim.getParameterNumber(TripleSpringSim.en.SPRING_STIFFNESS);
  this.addControl(new SliderControl(pn, 1, 60, /*multiply=*/true));
  pn = sim.getParameterNumber(EnergyInfo.en.PE_OFFSET);
  this.addControl(new NumericControl(pn));

  this.addStandardControls();
  this.addControl(new ButtonControl(TripleSpringSim.i18n.REST_STATE,
      () => sim.restState()));
  this.makeEasyScript();
  this.addURLScriptButton();
};

/** @inheritDoc */
override toString() {
  return this.toStringShort().slice(0, -1)
      +', bob: '+this.bob.toStringShort()
      +', springs.length: '+this.springs.length
      +', anchors.length: '+this.anchors.length
      + super.toString();
};

/** @inheritDoc */
getClassName() {
  return 'TripleSpringApp';
};

/** @inheritDoc */
override defineNames(myName: string): void {
  super.defineNames(myName);
  this.terminal.addRegex('anchors|bob|springs', myName+'.');
};

} // end class

Util.defineGlobal('sims$springs$TripleSpringApp', TripleSpringApp);
