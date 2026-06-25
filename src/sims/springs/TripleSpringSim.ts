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

import { AbstractODESim, ODESim } from '../../lab/model/ODESim.js';
import { EnergySystem, EnergyInfo } from '../../lab/model/EnergySystem.js';
import { EventHandler, ModifierKeys } from '../../lab/app/EventHandler.js';
import { ParameterNumber } from '../../lab/util/Observe.js';
import { PointMass } from '../../lab/model/PointMass.js';
import { SimObject } from '../../lab/model/SimObject.js';
import { Simulation } from '../../lab/model/Simulation.js';
import { Spring } from '../../lab/model/Spring.js';
import { Util } from '../../lab/util/Util.js';
import { VarsList } from '../../lab/model/VarsList.js';
import { Vector } from '../../lab/util/Vector.js';

const X = 0;
const Y = 1;
const VX = 2;
const VY = 3;
const KE = 4;
const PE = 5;
const TE = 6;
const TIME = 7;
const ANCHOR1_X = 8;
const ANCHOR1_Y = 9;
const ANCHOR2_X = 10;
const ANCHOR2_Y = 11;
const ANCHOR3_X = 12;
const ANCHOR3_Y = 13;

/** A 2D oscillator with one central mass connected to three fixed springs.

The three springs are fixed to anchor points separated by 45 degrees, at
45, 90, and 135 degrees around the central mass. The moving mass is affected
by spring forces, gravity, and linear damping.
*/
export class TripleSpringSim extends AbstractODESim implements Simulation, ODESim,
    EventHandler, EnergySystem {

  private isDragging_: boolean = false;
  private gravity_: number = 2.0;
  private damping_: number = 0.08;
  private anchorRadius_: number = 3.0;
  private potentialOffset_: number = 0;
  private anchors_: PointMass[] = [
    PointMass.makeSquare(0.35, 'anchor1'),
    PointMass.makeSquare(0.35, 'anchor2'),
    PointMass.makeSquare(0.35, 'anchor3')
  ];
  private bob_: PointMass = PointMass.makeCircle(0.55, 'bob');
  private springs_: Spring[] = [
    new Spring('spring1', this.anchors_[0], Vector.ORIGIN, this.bob_,
        Vector.ORIGIN, 2.9, 10.0),
    new Spring('spring2', this.anchors_[1], Vector.ORIGIN, this.bob_,
        Vector.ORIGIN, 2.9, 10.0),
    new Spring('spring3', this.anchors_[2], Vector.ORIGIN, this.bob_,
        Vector.ORIGIN, 2.9, 10.0)
  ];

/**
* @param opt_name name of this as a Subject
*/
constructor(opt_name?: string) {
  super(opt_name);
  const var_names = [
    TripleSpringSim.en.X_POSITION,
    TripleSpringSim.en.Y_POSITION,
    TripleSpringSim.en.X_VELOCITY,
    TripleSpringSim.en.Y_VELOCITY,
    EnergyInfo.en.KINETIC_ENERGY,
    EnergyInfo.en.POTENTIAL_ENERGY,
    EnergyInfo.en.TOTAL_ENERGY,
    VarsList.en.TIME,
    TripleSpringSim.en.ANCHOR1_X,
    TripleSpringSim.en.ANCHOR1_Y,
    TripleSpringSim.en.ANCHOR2_X,
    TripleSpringSim.en.ANCHOR2_Y,
    TripleSpringSim.en.ANCHOR3_X,
    TripleSpringSim.en.ANCHOR3_Y
  ];
  const i18n_names = [
    TripleSpringSim.i18n.X_POSITION,
    TripleSpringSim.i18n.Y_POSITION,
    TripleSpringSim.i18n.X_VELOCITY,
    TripleSpringSim.i18n.Y_VELOCITY,
    EnergyInfo.i18n.KINETIC_ENERGY,
    EnergyInfo.i18n.POTENTIAL_ENERGY,
    EnergyInfo.i18n.TOTAL_ENERGY,
    VarsList.i18n.TIME,
    TripleSpringSim.i18n.ANCHOR1_X,
    TripleSpringSim.i18n.ANCHOR1_Y,
    TripleSpringSim.i18n.ANCHOR2_X,
    TripleSpringSim.i18n.ANCHOR2_Y,
    TripleSpringSim.i18n.ANCHOR3_X,
    TripleSpringSim.i18n.ANCHOR3_Y
  ];
  const va = new VarsList(var_names, i18n_names, this.getName()+'_VARS');
  this.setVarsList(va);
  va.setComputed(KE, PE, TE);
  this.bob_.setMass(1.0);
  this.springs_.forEach(spring => spring.setDamping(0.04));
  this.setAnchorObjectsFromRadius();
  this.getSimList().add(this.anchors_[0], this.anchors_[1], this.anchors_[2],
      this.bob_, this.springs_[0], this.springs_[1], this.springs_[2]);
  let pn: ParameterNumber;
  this.addParameter(new ParameterNumber(this, TripleSpringSim.en.GRAVITY,
      TripleSpringSim.i18n.GRAVITY,
      () => this.getGravity(), a => this.setGravity(a)));
  this.addParameter(new ParameterNumber(this, TripleSpringSim.en.MASS,
      TripleSpringSim.i18n.MASS,
      () => this.getMass(), a => this.setMass(a)));
  this.addParameter(new ParameterNumber(this, TripleSpringSim.en.DAMPING,
      TripleSpringSim.i18n.DAMPING,
      () => this.getDamping(), a => this.setDamping(a)));
  this.addParameter(new ParameterNumber(this, TripleSpringSim.en.ANCHOR_RADIUS,
      TripleSpringSim.i18n.ANCHOR_RADIUS,
      () => this.getAnchorRadius(), a => this.setAnchorRadius(a)));
  this.addParameter(new ParameterNumber(this, TripleSpringSim.en.SPRING_LENGTH,
      TripleSpringSim.i18n.SPRING_LENGTH,
      () => this.getSpringRestLength(), a => this.setSpringRestLength(a)));
  this.addParameter(new ParameterNumber(this, TripleSpringSim.en.SPRING_STIFFNESS,
      TripleSpringSim.i18n.SPRING_STIFFNESS,
      () => this.getSpringStiffness(), a => this.setSpringStiffness(a)));
  this.addParameter(pn = new ParameterNumber(this, EnergyInfo.en.PE_OFFSET,
      EnergyInfo.i18n.PE_OFFSET,
      () => this.getPEOffset(), a => this.setPEOffset(a)));
  pn.setLowerLimit(Number.NEGATIVE_INFINITY);
  pn.setSignifDigits(5);
  this.restState();
  const vars = va.getValues();
  vars[X] = 0.35;
  vars[Y] = -0.18;
  vars[VX] = 0.0;
  vars[VY] = 0.8;
  va.setValues(vars);
  this.modifyObjects();
  this.saveInitialState();
};

/** @inheritDoc */
override toString() {
  return this.toStringShort().slice(0, -1)
      +', gravity_: '+Util.NF(this.gravity_)
      +', damping_: '+Util.NF(this.damping_)
      +', anchorRadius_: '+Util.NF(this.anchorRadius_)
      +', bob_: '+this.bob_
      +', potentialOffset_: '+Util.NF(this.potentialOffset_)
      + super.toString();
};

/** @inheritDoc */
getClassName() {
  return 'TripleSpringSim';
};

/** Sets the central mass to the reference state and zeroes potential energy. */
restState(): void {
  const vars = this.getVarsList().getValues();
  this.captureAnchorPositions(vars);
  vars[X] = 0;
  vars[Y] = 0;
  vars[VX] = 0;
  vars[VY] = 0;
  this.getVarsList().setValues(vars);
  this.moveObjects(vars);
  this.potentialOffset_ = 0;
  this.setPEOffset(-this.getEnergyInfo().getPotential());
};

/** @inheritDoc */
getEnergyInfo(): EnergyInfo {
  const ke = this.bob_.getKineticEnergy();
  let pe = this.gravity_ * this.bob_.getMass() * this.bob_.getPosition().getY();
  this.springs_.forEach(spring => pe += spring.getPotentialEnergy());
  return new EnergyInfo(pe + this.potentialOffset_, ke);
};

/** @inheritDoc */
getPEOffset(): number {
  return this.potentialOffset_;
}

/** @inheritDoc */
setPEOffset(value: number): void {
  this.potentialOffset_ = value;
  this.getVarsList().incrSequence(PE, TE);
  this.broadcastParameter(EnergyInfo.en.PE_OFFSET);
};

/** @inheritDoc */
modifyObjects(): void {
  const va = this.getVarsList();
  const vars = va.getValues();
  this.moveObjects(vars);
  const ei = this.getEnergyInfo();
  va.setValue(KE, ei.getTranslational(), true);
  va.setValue(PE, ei.getPotential(), true);
  va.setValue(TE, ei.getTotalEnergy(), true);
};

private moveObjects(vars: number[]): void {
  this.bob_.setPosition(new Vector(vars[X], vars[Y]));
  this.bob_.setVelocity(new Vector(vars[VX], vars[VY], 0));
  this.anchors_[0].setPosition(new Vector(vars[ANCHOR1_X], vars[ANCHOR1_Y]));
  this.anchors_[1].setPosition(new Vector(vars[ANCHOR2_X], vars[ANCHOR2_Y]));
  this.anchors_[2].setPosition(new Vector(vars[ANCHOR3_X], vars[ANCHOR3_Y]));
};

private setAnchorObjectsFromRadius(): void {
  const angles = [Math.PI/4, Math.PI/2, 3*Math.PI/4];
  this.anchors_.forEach((anchor, index) => {
    const angle = angles[index];
    anchor.setPosition(new Vector(this.anchorRadius_ * Math.cos(angle),
        this.anchorRadius_ * Math.sin(angle)));
  });
};

private setAnchorVarsFromRadius(vars: number[]): void {
  const angles = [Math.PI/4, Math.PI/2, 3*Math.PI/4];
  angles.forEach((angle, index) => {
    const offset = ANCHOR1_X + 2*index;
    vars[offset] = this.anchorRadius_ * Math.cos(angle);
    vars[offset + 1] = this.anchorRadius_ * Math.sin(angle);
  });
};

private captureAnchorPositions(vars: number[]): void {
  this.anchors_.forEach((anchor, index) => {
    const offset = ANCHOR1_X + 2*index;
    const position = anchor.getPosition();
    vars[offset] = position.getX();
    vars[offset + 1] = position.getY();
  });
};

/** @inheritDoc */
startDrag(simObject: null|SimObject, _location: Vector, _offset: Vector,
    _dragBody: null|Vector, _modifiers: ModifierKeys): boolean {
  if (simObject == this.bob_) {
    this.isDragging_ = true;
    return true;
  } else if (this.anchors_.indexOf(simObject as PointMass) >= 0) {
    return true;
  }
  return false;
};

/** @inheritDoc */
mouseDrag(simObject: null|SimObject, location: Vector, offset: Vector): void {
  const va = this.getVarsList();
  const p = location.subtract(offset);
  const anchorIndex = this.anchors_.indexOf(simObject as PointMass);
  if (anchorIndex >= 0) {
    const varIndex = ANCHOR1_X + 2*anchorIndex;
    va.setValue(varIndex, p.getX());
    va.setValue(varIndex + 1, p.getY());
    va.incrSequence(PE, TE);
  } else if (simObject == this.bob_) {
    va.setValue(X, p.getX());
    va.setValue(Y, p.getY());
    va.setValue(VX, 0);
    va.setValue(VY, 0);
  } else {
    return;
  }
  this.moveObjects(va.getValues());
};

/** @inheritDoc */
finishDrag(_simObject: null|SimObject, _location: Vector, _offset: Vector): void {
  this.isDragging_ = false;
};

/** @inheritDoc */
handleKeyEvent(_evt: KeyboardEvent, _pressed: boolean,
    _modifiers: ModifierKeys): void {
};

/** @inheritDoc */
evaluate(vars: number[], change: number[], _timeStep: number): null|object {
  Util.zeroArray(change);
  this.moveObjects(vars);
  change[TIME] = 1;
  if (!this.isDragging_) {
    let fx = 0;
    let fy = -this.gravity_ * this.bob_.getMass();
    this.springs_.forEach(spring => {
      const forces = spring.calculateForces();
      const f = forces[1].getVector();
      fx += f.getX();
      fy += f.getY();
    });
    fx += -this.damping_ * vars[VX];
    fy += -this.damping_ * vars[VY];
    const m = this.bob_.getMass();
    change[X] = vars[VX];
    change[Y] = vars[VY];
    change[VX] = fx / m;
    change[VY] = fy / m;
  }
  return null;
};

getGravity(): number {
  return this.gravity_;
};

setGravity(value: number): void {
  this.gravity_ = value;
  this.getVarsList().incrSequence(PE, TE);
  this.broadcastParameter(TripleSpringSim.en.GRAVITY);
};

getMass(): number {
  return this.bob_.getMass();
};

setMass(value: number): void {
  this.bob_.setMass(value);
  this.getVarsList().incrSequence(KE, PE, TE);
  this.broadcastParameter(TripleSpringSim.en.MASS);
};

getDamping(): number {
  return this.damping_;
};

setDamping(value: number): void {
  this.damping_ = value;
  this.springs_.forEach(spring => spring.setDamping(value/2));
  this.broadcastParameter(TripleSpringSim.en.DAMPING);
};

getAnchorRadius(): number {
  return this.anchorRadius_;
};

setAnchorRadius(value: number): void {
  this.anchorRadius_ = value;
  const va = this.getVarsList();
  const vars = va.getValues();
  this.setAnchorVarsFromRadius(vars);
  va.setValues(vars);
  this.moveObjects(vars);
  va.incrSequence(PE, TE);
  this.broadcastParameter(TripleSpringSim.en.ANCHOR_RADIUS);
};

getSpringRestLength(): number {
  return this.springs_[0].getRestLength();
};

setSpringRestLength(value: number): void {
  this.springs_.forEach(spring => spring.setRestLength(value));
  this.getVarsList().incrSequence(PE, TE);
  this.broadcastParameter(TripleSpringSim.en.SPRING_LENGTH);
};

getSpringStiffness(): number {
  return this.springs_[0].getStiffness();
};

setSpringStiffness(value: number): void {
  this.springs_.forEach(spring => spring.setStiffness(value));
  this.getVarsList().incrSequence(PE, TE);
  this.broadcastParameter(TripleSpringSim.en.SPRING_STIFFNESS);
};

static readonly en: i18n_strings = {
  ANCHOR1_X: 'anchor 1 X',
  ANCHOR1_Y: 'anchor 1 Y',
  ANCHOR2_X: 'anchor 2 X',
  ANCHOR2_Y: 'anchor 2 Y',
  ANCHOR3_X: 'anchor 3 X',
  ANCHOR3_Y: 'anchor 3 Y',
  ANCHOR_RADIUS: 'anchor radius',
  X_POSITION: 'X position',
  Y_POSITION: 'Y position',
  X_VELOCITY: 'X velocity',
  Y_VELOCITY: 'Y velocity',
  DAMPING: 'damping',
  GRAVITY: 'gravity',
  MASS: 'mass',
  SPRING_LENGTH: 'spring length',
  SPRING_STIFFNESS: 'spring stiffness',
  REST_STATE: 'rest state'
};

static readonly de_strings: i18n_strings = {
  ANCHOR1_X: 'Anker 1 X',
  ANCHOR1_Y: 'Anker 1 Y',
  ANCHOR2_X: 'Anker 2 X',
  ANCHOR2_Y: 'Anker 2 Y',
  ANCHOR3_X: 'Anker 3 X',
  ANCHOR3_Y: 'Anker 3 Y',
  ANCHOR_RADIUS: 'Anker Radius',
  X_POSITION: 'X Position',
  Y_POSITION: 'Y Position',
  X_VELOCITY: 'X Geschwindigkeit',
  Y_VELOCITY: 'Y Geschwindigkeit',
  DAMPING: 'Dampfung',
  GRAVITY: 'Gravitation',
  MASS: 'Masse',
  SPRING_LENGTH: 'Federlange',
  SPRING_STIFFNESS: 'Federsteifheit',
  REST_STATE: 'ruhe Zustand'
};

static readonly i18n = Util.LOCALE === 'de' ? TripleSpringSim.de_strings :
    TripleSpringSim.en;

} // end class

type i18n_strings = {
  ANCHOR1_X: string,
  ANCHOR1_Y: string,
  ANCHOR2_X: string,
  ANCHOR2_Y: string,
  ANCHOR3_X: string,
  ANCHOR3_Y: string,
  ANCHOR_RADIUS: string,
  X_POSITION: string,
  Y_POSITION: string,
  X_VELOCITY: string,
  Y_VELOCITY: string,
  DAMPING: string,
  GRAVITY: string,
  MASS: string,
  SPRING_LENGTH: string,
  SPRING_STIFFNESS: string,
  REST_STATE: string
};

Util.defineGlobal('sims$springs$TripleSpringSim', TripleSpringSim);
