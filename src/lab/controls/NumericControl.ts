// Copyright 2016 Erik Neumann.  All Rights Reserved.
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

import { LabControl } from './LabControl.js'
import { Observer, Parameter, SubjectEvent, ParameterNumber } from '../util/Observe.js'
import { Util } from '../util/Util.js'

type SliderRange = {
  min: number,
  max: number,
  autoMin: boolean,
  autoMax: boolean
};

/** A text input element for displaying and editing the numeric value of a target
object.

Because this is an {@link Observer}, you can connect it to a Subject;
when the Subject broadcasts events, the {@link observe} method
ensures that this control reflects the current target value.

### Number Formatting

The number is formatted without any thousands separators and with the number of
fractional decimal places depending on the "mode".

+ **Fixed decimal places mode** shows the number of decimal places given by
{@link getDecimalPlaces}.
Ignores significant digits setting. *Fixed decimal places mode* is active when
`getDecimalPlaces()` returns 0 or greater.

+ **Variable decimal places mode** ensures that the requested number of significant
digits are visible. Adjusts decimal places shown based on the magnitude of the value.
See {@link setSignifDigits}. *Variable decimal places mode* is
active when `getDecimalPlaces()` returns –1.

The default setting is *variable decimal places mode* with 3 significant digits.

The displayed value is rounded to a certain number of digits, and therefore the
displayed value can differ from the target value. NumericControlBase allows for
this difference by only making changes to the target value when the the user
modifies the displayed value, or when {@link setValue} is called.

### Preventing Forbidden Values

To prevent the user from entering forbidden values (such as enforcing upper or lower
limits) the setter function can throw an Error. An alert is displayed to the user with
the text of the Error. After dismissing the alert, the displayed value will be restored
to match the current target value, as returned by the `getter`. (Note that the user's
input is discarded).

### To Do List

There is a problem with the current variable mode which is when you have a
very tiny number, say 1.234567e-12, then it will format it like: 0.000000000001234567
when setting the significant digits to 7 and decimals to be variable. This is usually
far bigger than we want. It should instead either switch to exponential, or have a
maximum limit on the number of decimals shown.  Or a limit on total number of digits
shown, switching to exponential when needed.

*/
export class NumericControlBase implements Observer, LabControl {
  /** the name shown in a label next to the textField */
  private label_: string;
  /** function that returns the current target value */
  private getter_: ()=>number;
  /** function to change the target value */
  private setter_: (value: number)=>void;
  /** The exact value of the target as last seen by this control;
  * note that the displayed value may be different due to rounding.
  */
  private value_: number;
  /** The number of significant digits to display. */
  private signifDigits_: number = 3;
  /** Fixed number of fractional decimal places to show, or –1 if variable. */
  private decimalPlaces_: number = -1;
  /** The number of columns (characters) shown in the text field. */
  private columns_: number = Math.max(8, 1+this.signifDigits_);
  /** the text field showing the double value */
  private textField_: HTMLInputElement;
  private topElement_: HTMLElement;
  /** The last value that the text field was set to, used to detect when user has
  intentionally changed the value;  note that the target value will be different
  than this because of rounding.
  */
  private lastValue_: string = '';
  private changeFn_: (e:Event)=>void;
  private focusFn_: (e:Event)=>void;
  private clickFn_: (e:Event)=>void;
  /**  True when first click in field after gaining focus. */
  private firstClick_: boolean = false;

/**
* @param label the text shown in a label next to the number input field
* @param getter function that returns the current target value
* @param setter function to change the target value
* @param textField  the text field to use; if not provided, then
*     a text field is created.
*/
constructor(label: string, getter: ()=>number, setter: (value: number)=>void,
    textField?: HTMLInputElement) {
  this.label_ = label;
  this.getter_ = getter;
  this.setter_ = setter;
  this.value_ = getter();
  if (typeof this.value_ !== 'number') {
    throw 'not a number '+this.value_;
  }
  let labelElement = null;
  if (textField !== undefined) {
    // see if the parent is a label
    const parent = textField.parentElement;
    if (parent !== null && parent.tagName == 'LABEL') {
      labelElement = parent as HTMLLabelElement;
    }
  } else {
    // create input text field and label
    textField = document.createElement('input');
    textField.type = 'text';
    textField.size = this.columns_;
    labelElement = document.createElement('label');
    labelElement.appendChild(document.createTextNode(
        Util.localizeControlLabel(this.label_)));
    labelElement.appendChild(textField);
  }
  this.textField_ = textField;
  this.topElement_ = labelElement !== null ? labelElement : this.textField_;
  this.textField_.style.textAlign = 'right';
  this.changeFn_ = this.validate.bind(this);
  this.textField_.addEventListener('change', this.changeFn_, /*capture=*/true);
  this.focusFn_ = this.gainFocus.bind(this);
  this.textField_.addEventListener('focus', this.focusFn_, /*capture=*/false);
  this.clickFn_ = this.doClick.bind(this);
  this.textField_.addEventListener('click', this.clickFn_, /*capture=*/false);
  this.formatTextField();
};

// HISTORY: Oct 13 2014. The NumericControlBase input fields are too small
// under Safari browser, but OK under Chrome. I've bumped up the 'size' of
// the input fields by one, so it now looks OK under Safari, but is a
// little too wide in Chrome.

/** @inheritDoc */
toString() {
  return this.toStringShort().slice(0, -1)
      +', signifDigits_: '+this.signifDigits_
      +', decimalPlaces_: '+this.decimalPlaces_
      +', columns_: '+this.columns_
      +'}';
};

/** @inheritDoc */
toStringShort() {
  return this.getClassName() + '{label_: "'+this.label_+'"}';
};

/** Returns the number of columns needed to show the number with the given number of
significant digits.
@param x the number to display
@param sigDigits the number of significant digits to show
@return the number of columns needed
*/
private columnsNeeded(x: number, sigDigits: number): number {
  const mag = NumericControlBase.magnitude(x);
  return 2 + this.decimalPlacesNeeded(x, sigDigits) + (mag > 0 ? mag : 0);
};

/** Returns the number of fractional decimal places needed to show the number
with the given number of significant digits.
@param x the number to display
@param sigDigits the number of significant digits to show
@return the number of fractional decimal places needed
*/
private decimalPlacesNeeded(x: number, sigDigits: number): number {
  if (this.decimalPlaces_ > -1) {
    return this.decimalPlaces_;
  } else {
    let d = sigDigits - 1 - NumericControlBase.magnitude(x);
    // limit of 16 decimal places; this could be a settable option.
    if (d > 16) {
      d = 16;
    }
    return d > 0 ? d : 0;
  }
};

/** @inheritDoc */
disconnect(): void {
  this.textField_.removeEventListener('change', this.changeFn_, /*capture=*/true);
  this.textField_.removeEventListener('focus', this.focusFn_, /*capture=*/false);
  this.textField_.removeEventListener('click', this.clickFn_, /*capture=*/false);
};

/**
* @param _event the event that caused this callback to fire
*/
private doClick(_event: Event) {
  if (this.firstClick_) {
    // first click after gaining focus should select entire field
    this.textField_.select();
    this.firstClick_ = false;
  }
};

/**  Sets the text field to match this.value_.
*/
private formatTextField(): void {
  const dec = this.decimalPlacesNeeded(this.value_, this.signifDigits_);
  const col = this.columnsNeeded(this.value_, this.signifDigits_);
  /*if (Util.DEBUG) {
    console.log('columnsNeeded '+col+' dec='+dec+' x='
        +Util.NFE(this.value_)+' '+this.label_);
  }*/
  this.lastValue_ = this.value_.toFixed(dec);
  this.textField_.value = this.lastValue_;
  if (col != this.columns_) {
    this.columns_ = col;
    this.textField_.size =this.columns_;
  }
};

/**
* @param _event the event that caused this callback to fire
*/
private gainFocus(_event: Event) {
  this.firstClick_ = true;
};

/** Returns name of class of this object.
* @return name of class of this object.
*/
getClassName(): string {
  return 'NumericControlBase';
};

/** Returns the fixed number of fractional decimal places to show when formatting
the number, or –1 when in *variable decimal places mode*.
@return the fixed number of fractional decimal places to show when formatting
    the number, or –1 when in *variable decimal places mode*.
*/
getDecimalPlaces(): number {
  return this.decimalPlaces_;
};

/** @inheritDoc */
getElement(): HTMLElement {
  return this.topElement_;
};

/** @inheritDoc */
getParameter(): null|Parameter {
  return null;
};

/** Returns the number of significant digits to show when formatting the number. Only
has an effect in *variable decimal places mode*,
see {@link getDecimalPlaces}.
@return the number of significant digits to show when formatting the number
*/
getSignifDigits(): number {
  return this.signifDigits_;
};

/** Returns the value of this control (which should match the target value if
{@link observe} is being called). The displayed value may be
different due to rounding.
@return the value of this control
*/
getValue(): number {
  return this.value_;
};

private static magnitude(x: number): number {
  if (Math.abs(x) < 1E-15) {
    // fix for displaying zero.
    return 0;
  } else {
    return Math.floor(Math.LOG10E * Math.log(Math.abs(x)));
  }
};

/** @inheritDoc */
observe(_event: SubjectEvent): void {
  // Ensures that the value displayed by the control matches the target value.
  this.setValue(this.getter_());
};

/** Sets the fixed number of fractional decimal places to show when formatting the
number, or a value of –1 puts this into *variable decimal places mode* where
the number of decimal places depends on the desired number of significant digits.
See {@link setSignifDigits}.
@param decimalPlaces the fixed number of fractional decimal places to show when
    formatting the number, or –1 to have variable number of fractional decimal places.
@return this object for chaining setters
*/
setDecimalPlaces(decimalPlaces: number): NumericControlBase {
  if (this.decimalPlaces_ != decimalPlaces) {
    this.decimalPlaces_ = decimalPlaces > -1 ? decimalPlaces : -1;
    this.formatTextField();
  }
  return this;
};

/** @inheritDoc */
setEnabled(enabled: boolean): void {
  this.textField_.disabled = !enabled;
};

/** Sets the number of significant digits to show when formatting the number. Only
has an effect in *variable decimal places mode*,
see {@link setDecimalPlaces}.
@param signifDigits the number of significant digits to show when
    formatting the number
@return this object for chaining setters
*/
setSignifDigits(signifDigits: number): NumericControlBase {
  if (this.signifDigits_ != signifDigits) {
    this.signifDigits_ = signifDigits;
    this.formatTextField();
  }
  return this;
};

/** Changes the value shown by this control, and sets the target to this value.
* @param value  the new value
*/
setValue(value: number): void {
  if (value != this.value_) {
    /*if (Util.DEBUG) {
      console.log('NumericControlBase.setValue value='+value+' vs '+this.value_);
    }*/
    try {
      if (isNaN(value)) {
        throw 'not a number '+value;
      }
      // set this.value_ first to prevent the observe() coming here twice
      this.value_ = value;
      // parameter_.setValue() broadcasts which causes observe() to be called here
      this.setter_(value);
    } catch(ex) {
      alert(ex);
      this.value_ = this.getter_();
    }
    this.formatTextField();
  }
};

/** Checks that an entered number is a valid number, updates the target value
* if valid; if an exception occurs then shows an alert and restores the old value.
* @param _event the event that caused this callback to fire
*/
private validate(_event: Event): void {
  // trim whitespace from start and end of string
  const nowValue = this.textField_.value.replace(/^\s*|\s*$/g, '');
  // Compare the current and previous text value of the field.
  // Note that the double value may be different from the text value because
  // of rounding.
  if (nowValue != this.lastValue_) {
    const value = parseFloat(nowValue);
    if (isNaN(value)) {
      alert('not a number: '+nowValue);
      this.formatTextField();
    } else {
      this.setValue(value);
    }
  }
};

} // end NumericControlBase class
Util.defineGlobal('lab$controls$NumericControlBase', NumericControlBase);


// ***************************** NumericControl *****************************

/** A text input element for displaying and editing the numeric value of a
* {@link ParameterNumber}.
*/
export class NumericControl extends NumericControlBase {
  private parameter_: ParameterNumber;
  private slider_: HTMLInputElement|null = null;
  private sliderMin_: number = 0;
  private sliderMax_: number = 1;
  private autoMin_: boolean = false;
  private autoMax_: boolean = false;
  private changeSliderFn_: (e:Event)=>void;

/**
* @param parameter the ParameterNumber to display and edit
* @param textField  the text field to use; if not provided, then
*     a text field is created.
*/
constructor(parameter: ParameterNumber, textField?: HTMLInputElement) {
  super(parameter.getName(/*localized=*/true)+parameter.getUnits(),
      () => parameter.getValue(), a => parameter.setValue(a), textField);
  this.parameter_ = parameter;
  this.changeSliderFn_ = this.changeSlider.bind(this);
  this.setSignifDigits(parameter.getSignifDigits());
  this.setDecimalPlaces(parameter.getDecimalPlaces());
  this.addSlider();
  this.parameter_.getSubject().addObserver(this);
};

/** @inheritDoc */
override toString() {
  return super.toString().slice(0, -1)
      + ', parameter_: '+this.parameter_.toStringShort()+'}';
};

/** @inheritDoc */
override disconnect(): void {
  super.disconnect();
  this.parameter_.getSubject().removeObserver(this);
  if (this.slider_ != null) {
    this.slider_.removeEventListener('input', this.changeSliderFn_,
        /*capture=*/true);
    this.slider_.removeEventListener('change', this.changeSliderFn_,
        /*capture=*/true);
  }
};

/** @inheritDoc */
override getClassName(): string {
  return 'NumericControl';
};

/** @inheritDoc */
override getParameter(): null|Parameter {
  return this.parameter_;
};

/** @inheritDoc */
override observe(event: SubjectEvent): void {
  if (event === this.parameter_) {
    super.observe(event);
    this.setSignifDigits(this.parameter_.getSignifDigits());
    this.setDecimalPlaces(this.parameter_.getDecimalPlaces());
    this.syncSliderToValue();
  }
};

/** @inheritDoc */
override setEnabled(enabled: boolean): void {
  super.setEnabled(enabled);
  if (this.slider_ != null) {
    this.slider_.disabled = !enabled;
  }
};

/** @inheritDoc */
override setValue(value: number): void {
  super.setValue(value);
  this.syncSliderToValue();
};

private addSlider(): void {
  if (this.parameter_.isComputed() || this.parameter_.getChoices().length > 0) {
    return;
  }
  const value = this.parameter_.getValue();
  if (!Number.isFinite(value)) {
    return;
  }
  const element = super.getElement();
  element.classList.add('numeric_control');
  this.makeSliderRange(value);
  const slider = document.createElement('input');
  slider.type = 'range';
  if (slider.type == 'text') {
    return;
  }
  this.slider_ = slider;
  slider.className = 'numeric_slider';
  slider.setAttribute('aria-label', Util.localizeControlLabel(
      this.parameter_.getName(/*localized=*/true)+this.parameter_.getUnits()));
  this.applySliderRange();
  slider.value = String(this.clamp(value));
  slider.addEventListener('input', this.changeSliderFn_, /*capture=*/true);
  slider.addEventListener('change', this.changeSliderFn_, /*capture=*/true);
  element.appendChild(slider);
};

private applySliderRange(): void {
  if (this.slider_ == null) {
    return;
  }
  this.slider_.min = String(this.sliderMin_);
  this.slider_.max = String(this.sliderMax_);
  this.slider_.step = String(this.sliderStep());
};

private changeSlider(_event: Event): void {
  if (this.slider_ == null) {
    return;
  }
  const value = Number(this.slider_.value);
  if (Number.isFinite(value)) {
    super.setValue(value);
    this.syncSliderToValue();
  }
};

private clamp(value: number): number {
  return Math.max(this.sliderMin_, Math.min(this.sliderMax_, value));
};

private makeSliderRange(value: number): void {
  const range = this.suggestSliderRange(value);
  this.sliderMin_ = range.min;
  this.sliderMax_ = range.max;
  this.autoMin_ = range.autoMin;
  this.autoMax_ = range.autoMax;
};

private suggestSliderRange(value: number): SliderRange {
  const lower = this.parameter_.getLowerLimit();
  const upper = this.parameter_.getUpperLimit();
  const safe = NumericControl.safeRangeForName(this.parameter_.getName());
  let autoMin = !Number.isFinite(lower) && safe == null;
  let autoMax = !Number.isFinite(upper) && safe == null;
  let min: number;
  let max: number;
  if (safe != null) {
    min = safe.min;
    max = safe.max;
  } else {
    const conservative = Math.max(Math.abs(value), 1);
    min = autoMin ? value - conservative : lower;
    max = autoMax ? value + conservative : upper;
  }
  if (Number.isFinite(lower)) {
    min = Math.max(min, lower);
  }
  if (Number.isFinite(upper)) {
    max = Math.min(max, upper);
  }
  const margin = Math.max(0.1, 0.2*Math.abs(value));
  if (value < min && !Number.isFinite(lower)) {
    min = value - margin;
  }
  if (value > max && !Number.isFinite(upper)) {
    max = value + margin;
  }
  if (min >= max) {
    const magnitude = Math.max(Math.abs(value), 1);
    min = Number.isFinite(lower) ? lower : value - magnitude;
    max = Number.isFinite(upper) ? upper : value + magnitude;
  }
  if (min >= max) {
    max = min + 1;
  }
  return { min, max, autoMin, autoMax };
};

private static safeRangeForName(name: string): null|{min: number, max: number} {
  for (const rule of NumericControl.SAFE_RANGES) {
    if (rule.match.test(name)) {
      return { min: rule.min, max: rule.max };
    }
  }
  return null;
};

private static readonly SAFE_RANGES = [
  { match: /TIME_STEP/, min: 0.001, max: 0.08 },
  { match: /DISPLAY_PERIOD/, min: 0.005, max: 0.2 },
  { match: /TIME_RATE/, min: 0, max: 3 },
  { match: /TIME_WINDOW/, min: 1, max: 30 },
  { match: /ELASTICITY|COEF.*FRICTION/, min: 0, max: 1 },
  { match: /COLLISION_ACCURACY/, min: 0.05, max: 1 },
  { match: /TOLERANCE|ACCURACY/, min: 0, max: 1 },
  { match: /GRAVITY/, min: 0, max: 20 },
  { match: /DAMPING|FRICTION|ANCHOR_DAMPING/, min: 0, max: 5 },
  { match: /SPRING_DAMPING/, min: 0, max: 2 },
  { match: /STIFFNESS|MAGNET_STRENGTH/, min: 0, max: 100 },
  { match: /MASS|DENSITY|TENSION/, min: 0.1, max: 50 },
  { match: /LENGTH|DIAMETER|RADIUS|SEPARATION|CENTER_OF_MASS/, min: 0.05, max: 20 },
  { match: /ANGLE|SLOPE|ROTATE_RATIO/, min: -Math.PI, max: Math.PI },
  { match: /VELOCITY|SPEED/, min: -50, max: 50 },
  { match: /RPM/, min: 0, max: 10000 },
  { match: /TORQUE|FORCE/, min: 0, max: 100 },
  { match: /AMPLITUDE/, min: 0, max: 10 },
  { match: /FREQUENCY/, min: 0, max: 10 },
  { match: /POSITION|DISPLACEMENT|ANCHOR_.*[XY]/, min: -20, max: 20 },
  { match: /PE_OFFSET|POTENTIAL_ENERGY_OFFSET|ZERO_ENERGY_LEVEL/, min: -100, max: 100 },
  { match: /NUM|NUMBER|LINKS|POINTS|MAGNETS|OBJECTS|SEED/, min: 0, max: 100 },
  { match: /GRAPH_WIDTH|SIM_WIDTH|TIME_GRAPH_WIDTH/, min: 0.2, max: 1 },
  { match: /^WIDTH$|^HEIGHT$/, min: 200, max: 1200 },
  { match: /LINE_WIDTH|DRAW_WIDTH/, min: 0.5, max: 6 },
  { match: /REPEAT_TIME/, min: 0.25, max: 20 }
] as const;

private syncSliderToValue(): void {
  if (this.slider_ == null) {
    return;
  }
  const value = this.parameter_.getValue();
  if (!Number.isFinite(value)) {
    return;
  }
  this.updateAutoRange(value);
  this.slider_.value = String(this.clamp(value));
};

private sliderStep(): number {
  const range = this.sliderMax_ - this.sliderMin_;
  if (this.parameter_.getDecimalPlaces() == 0) {
    return Math.max(1, Math.round(range / 1000));
  }
  return range / 1000;
};

private updateAutoRange(value: number): void {
  let changed = false;
  const range = this.sliderMax_ - this.sliderMin_;
  if (this.autoMin_ && value <= this.sliderMin_ + 0.05*range) {
    this.sliderMin_ = value - Math.max(range, Math.abs(value), 1);
    changed = true;
  }
  if (this.autoMax_ && value >= this.sliderMax_ - 0.05*range) {
    this.sliderMax_ = value + Math.max(range, Math.abs(value), 1);
    changed = true;
  }
  if (changed) {
    this.applySliderRange();
  }
};

} // end NumericControl class
Util.defineGlobal('lab$controls$NumericControl', NumericControl);
