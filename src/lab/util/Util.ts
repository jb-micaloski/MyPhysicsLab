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

/** Provides static utility functions.
*/

/** An object that has a minimal string representation via its
{@link Printable.toStringShort} method.

When writing a `toString` method, use `toStringShort` on objects that are Printable.
This is mainly needed to avoid infinite loops, such as when an object prints a
{@link lab/util/Observe.Subject | Subject} or
{@link lab/util/Observe.Observer | Observer}.

This can also make printing an *array of Printable objects* more practical because we
only print minimal identity information, rather than the full `toString` representation
which would have too much information and be unreadable.
*/
export interface Printable {
/** Returns a minimal string representation of this object, usually giving just
identity information like the class name and name of the object.

For an object whose main purpose is to represent another Printable object, it is
recommended to include the result of calling `toStringShort` on that other object.
For example, calling `toStringShort()` on a DisplayShape might return something like
this:
```text
DisplayShape{polygon:Polygon{'chain3'}}
```
@return a minimal string representation of this object.
*/
toStringShort(): string;
};

/** An object that is notified when an error occurs.
See {@link lab/app/SimRunner.SimRunner.addErrorObserver | SimRunner.addErrorObserver}.
*/
export interface ErrorObserver extends Printable {
  /** This method is called when an error occurs.
  * @param error the error that caused the exception
  */
  notifyError(error: any): void;
};

/** Provides generally useful static functions. */
export class Util {

constructor() {
  throw '';
};

private static readonly ASSERTS: boolean = true;

/** Date and time when the code was compiled.
This value is set during the `esbuild` bundling phase with a `--define` option.
*/
// @ts-ignore
static readonly COMPILE_TIME = MPL_BUILD_TIME;

/** Flag indicates whether to include debug code, must be true for assertions
* to work. Must be set as a compiler option, by adding `UTIL_DEBUG=true` to
* the compile command. For example: `make testviewer UTIL_DEBUG=true`.
* See the shell script `compile_js.sh` and `makefile` for details.
* See [Customizing The Build Process](../Building.html#customizingthebuildprocess).
*/
static readonly DEBUG = true;

/** A string listing the the hexadecimal digits '0123456789abcdef'
*/
private static readonly HEX_DIGITS = '0123456789abcdef';

/** Specifies the relative URL of the directory containing images related to the user
* interface.
*/
static IMAGES_DIR = '.';

/** Specifies the language to use. The
[ISO 639-1 language code](http://www.loc.gov/standards/iso639-2/php/English_list.php)
is a two-letter lowercase code. For example, English is `en`, and German is `de`.
This value is set during the `esbuild` bundling phase with a `--define` option.
*/
// @ts-ignore
static LOCALE: string = MPL_LOCALE;

private static readonly PT_BR_CONTROL_LABELS: {[key: string]: string} = {
  'sim': 'simulação',
  'simulation': 'simulação',
  'graph': 'gráfico',
  'time graph': 'gráfico temporal',
  'multi graph': 'multigráfico',
  'show simulation': 'mostrar simulação',
  'show controls': 'mostrar controles',
  'show graph': 'mostrar gráfico',
  'show terminal': 'mostrar terminal',
  'show forces': 'mostrar forças',
  'show collisions': 'mostrar colisões',
  'show energy': 'mostrar energia',
  'show clock': 'mostrar relógio',
  'terminal': 'terminal',
  'controls': 'controles',
  'command >': 'comando >',
  'pan-zoom': 'mover/zoom',
  'background': 'fundo',
  'white': 'branco',
  'black': 'preto',
  'white with trails': 'branco com rastros',
  'black with trails': 'preto com rastros',
  'white with long trails': 'branco com rastros longos',
  'black with long trails': 'preto com rastros longos',
  'time': 'tempo',
  'time step': 'passo de tempo',
  'display period': 'período de exibição',
  'time rate': 'taxa de tempo',
  'restart': 'reiniciar',
  'running': 'em execução',
  'firing': 'disparo',
  'pause': 'pausar',
  'resume': 'retomar',
  'non-stop': 'contínuo',
  'step': 'passo',
  'share': 'compartilhar',
  'gravity': 'gravidade',
  'zero energy level': 'nível zero de energia',
  'damping': 'amortecimento',
  'rotate ratio': 'razão de rotação',
  'elasticity': 'elasticidade',
  'mass': 'massa',
  'length': 'comprimento',
  'spring length': 'comprimento da mola',
  'spring stiffness': 'rigidez da mola',
  'spring damping': 'amortecimento da mola',
  'sim-width': 'largura da simulação',
  'graph-width': 'largura do gráfico',
  'time-graph-width': 'largura do gráfico temporal',
  'layout': 'layout',
  'diff eq solver': 'solucionador diferencial',
  'euler': 'Euler',
  'runge kutta': 'Runge-Kutta',
  'runge-kutta': 'Runge-Kutta',
  'point mass': 'massa pontual',
  'polygon': 'polígono',
  'wall bottom': 'parede inferior',
  'wall right': 'parede direita',
  'wall left': 'parede esquerda',
  'wall top': 'parede superior',
  'anchor1 x': 'âncora 1 X',
  'anchor1 y': 'âncora 1 Y',
  'anchor2 x': 'âncora 2 X',
  'anchor2 y': 'âncora 2 Y',
  'anchor radius': 'raio dos apoios',
  'chain links': 'elos da corrente',
  'straight line': 'linha reta',
  'attach right': 'fixar à direita',
  'angle': 'ângulo',
  'angular velocity': 'velocidade angular',
  'position': 'posição',
  'position x': 'posição X',
  'position y': 'posição Y',
  'velocity': 'velocidade',
  'velocity x': 'velocidade X',
  'velocity y': 'velocidade Y',
  'density': 'densidade',
  'tension': 'tensão',
  'shape': 'forma',
  'number of points': 'número de pontos',
  'flat': 'plano',
  'half sine pulse': 'pulso de meia senoide',
  'multiple sine': 'senoide múltipla',
  'sine pulse': 'pulso senoidal',
  'square pulse': 'pulso quadrado',
  'triangle': 'triângulo',
  'triangle pulse': 'pulso triangular',
  'repeat time': 'tempo de repetição',
  'collision method': 'método de colisão',
  'collision accuracy': 'precisão da colisão',
  'distance tolerance': 'tolerância de distância',
  'velocity tolerance': 'tolerância de velocidade',
  'extra accel': 'aceleração extra',
  'random seed': 'semente aleatória',
  'simultaneous': 'simultâneo',
  'hybrid': 'híbrido',
  'serial grouped': 'serial agrupado',
  'serial grouped lastpass': 'serial agrupado na última passagem',
  'serial separate': 'serial separado',
  'serial separate lastpass': 'serial separado na última passagem',
  'potential energy': 'energia potencial',
  'translational energy': 'energia translacional',
  'kinetic energy': 'energia cinética',
  'rotational energy': 'energia rotacional',
  'total': 'total',
  'total energy': 'energia total',
  'potential energy offset': 'deslocamento da energia potencial',
  'draw mode': 'modo de desenho',
  'graph color': 'cor do gráfico',
  'graph draw mode': 'modo de desenho do gráfico',
  'graph points': 'pontos do gráfico',
  'draw width': 'espessura do traço',
  'dots': 'pontos',
  'lines': 'linhas',
  'x variable': 'variável X',
  'y variable': 'variável Y',
  'clear graph': 'limpar gráfico',
  'download graph': 'baixar gráfico',
  'download current graph data': 'baixar imagem e dados do gráfico atual',
  'could not download graph': 'não foi possível baixar o gráfico',
  '-none-': '-nenhum-',
  'aqua': 'ciano',
  'blue': 'azul',
  'fuchsia': 'fúcsia',
  'gray': 'cinza',
  'green': 'verde',
  'lime': 'verde-limão',
  'maroon': 'bordô',
  'navy': 'azul-marinho',
  'olive': 'oliva',
  'purple': 'roxo',
  'red': 'vermelho',
  'silver': 'prata',
  'teal': 'azul-petróleo',
  'yellow': 'amarelo',
  'rpm': 'RPM',
  'stall torque': 'torque de estol',
  'free speed': 'velocidade livre',
  'slope': 'inclinação',
  'wheel diameter': 'diâmetro da roda',
  'engine force': 'força do motor',
  'gravity force': 'força da gravidade',
  'coef static friction': 'coeficiente de atrito estático',
  'center of mass': 'centro de massa',
  'acceleration': 'aceleração',
  'acceleration-1': 'aceleração 1',
  'acceleration-2': 'aceleração 2',
  'active': 'ativo',
  'adaptive': 'adaptativo',
  'add block': 'adicionar bloco',
  'anchor': 'âncora',
  'anchor damping': 'amortecimento da âncora',
  'anchor x': 'âncora X',
  'anchor x velocity': 'velocidade X da âncora',
  'anchor y': 'âncora Y',
  'anchor y velocity': 'velocidade Y da âncora',
  'angle 1': 'ângulo 1',
  'angle 2': 'ângulo 2',
  'angle acceleration': 'aceleração angular',
  'angle between magnets': 'ângulo entre ímãs',
  'angle difference': 'diferença de ângulo',
  'angle velocity': 'velocidade angular',
  'angle velocity 1': 'velocidade angular 1',
  'angle velocity 2': 'velocidade angular 2',
  'angle-1': 'ângulo 1',
  'angle-1 velocity': 'velocidade angular 1',
  'angle-2': 'ângulo 2',
  'angle-2 velocity': 'velocidade angular 2',
  'aspect-ratio': 'proporção da tela',
  'asteroid': 'asteroide',
  'asteroid mass': 'massa do asteroide',
  'asteroid radius': 'raio do asteroide',
  'attract force': 'força de atração',
  'axis': 'eixo',
  'b': 'b',
  'ball': 'bola',
  'ball in box': 'bola na caixa',
  'block': 'bloco',
  'block length': 'comprimento do bloco',
  'block width': 'largura do bloco',
  'blue mass': 'massa azul',
  'bodies': 'corpos',
  'brachistochrone': 'braquistócrona',
  'brachistochrone-squared': 'braquistócrona ao quadrado',
  'car': 'carro',
  'car mass': 'massa do carro',
  'cardioid': 'cardioide',
  'cart': 'carro',
  'cart damping': 'amortecimento do carro',
  'cart mass': 'massa do carro',
  'cart position': 'posição do carro',
  'cart velocity': 'velocidade do carro',
  'center-x': 'centro X',
  'center-y': 'centro Y',
  'chain': 'corrente',
  'circle': 'círculo',
  'click': 'clique',
  'connected blocks': 'blocos conectados',
  'custom': 'personalizado',
  'distance': 'distância',
  'drag': 'arrastar',
  'drive amplitude': 'amplitude de acionamento',
  'drive frequency': 'frequência de acionamento',
  'enabled': 'habilitado',
  'endless loop': 'laço contínuo',
  'escape wheel': 'roda de escape',
  'extra block': 'bloco extra',
  'extra body': 'corpo extra',
  'fast ball': 'bola rápida',
  'finish-t': 'tempo final',
  'fixed ball': 'bola fixa',
  'fixed block': 'bloco fixo',
  'fixed point': 'ponto fixo',
  'fixed point left': 'ponto fixo esquerdo',
  'fixed point left x': 'ponto fixo esquerdo X',
  'fixed point left y': 'ponto fixo esquerdo Y',
  'fixed point right': 'ponto fixo direito',
  'force rotation rate': 'taxa de rotação da força',
  'formation': 'formação',
  'gear': 'engrenagem',
  'handle': 'alça',
  'handle force': 'força da alça',
  'height': 'altura',
  'hexagon': 'hexágono',
  'hollow box': 'caixa vazada',
  'horizontal-align': 'alinhamento horizontal',
  'hump': 'lombada',
  'in middle': 'no meio',
  'initial velocity': 'velocidade inicial',
  'kinetic': 'cinética',
  'l-shape': 'forma em L',
  'left': 'esquerda',
  'left gear': 'engrenagem esquerda',
  'lemniscate': 'lemniscata',
  'length 1': 'comprimento 1',
  'length 2': 'comprimento 2',
  'limit angle': 'limitar ângulo',
  'linear': 'linear',
  'loop': 'loop',
  'loop time': 'tempo do ciclo',
  'magnet strength': 'força do ímã',
  'magnetwheel': 'roda magnética',
  'mass 1': 'massa 1',
  'mass 2': 'massa 2',
  'mass of block1': 'massa do bloco 1',
  'mass-1': 'massa 1',
  'mass-2': 'massa 2',
  'moon': 'lua',
  'moon mass': 'massa da lua',
  'moon radius': 'raio da lua',
  'moon spin': 'rotação da lua',
  'non-linear': 'não linear',
  'number blocks': 'número de blocos',
  'number of atoms': 'número de átomos',
  'number of blocks': 'número de blocos',
  'number of bodies': 'número de corpos',
  'number of magnets': 'número de ímãs',
  'number of objects': 'número de objetos',
  'offset': 'deslocamento',
  'on wall': 'na parede',
  'one hits chain': 'uma bola atinge a corrente',
  'one hits chain plus one': 'uma bola atinge a corrente e mais uma',
  'one hits one': 'uma bola atinge uma',
  'one hits one asymmetric': 'uma bola atinge uma assimétrica',
  'one hits one on wall': 'uma bola atinge uma na parede',
  'one hits six': 'uma bola atinge seis',
  'one hits three': 'uma bola atinge três',
  'one hits two': 'uma bola atinge duas',
  'one hits two in box': 'uma bola atinge duas na caixa',
  'one hits two on wall': 'uma bola atinge duas na parede',
  'one hits two separate': 'uma bola atinge duas separadas',
  'one hits wall': 'uma bola atinge a parede',
  'oval': 'oval',
  'ovalness': 'ovalização',
  'parabola-down': 'parábola para baixo',
  'parabola-up': 'parábola para cima',
  'path': 'caminho',
  'path position': 'posição no caminho',
  'path velocity': 'velocidade no caminho',
  'pendulum': 'pêndulo',
  'pendulum angle': 'ângulo do pêndulo',
  'pendulum angle velocity': 'velocidade angular do pêndulo',
  'pendulum damping': 'amortecimento do pêndulo',
  'pendulum length': 'comprimento do pêndulo',
  'pendulum mass': 'massa do pêndulo',
  'pendulums': 'pêndulos',
  'pie wedge': 'setor circular',
  'pinned gears': 'engrenagens fixadas',
  'position 1': 'posição 1',
  'position 2': 'posição 2',
  'position-1': 'posição 1',
  'position-2': 'posição 2',
  'potential': 'potencial',
  'pseudo-gravity': 'pseudogravidade',
  'puck type': 'tipo de disco',
  'radius': 'raio',
  'rebuild': 'reconstruir',
  'red mass': 'massa vermelha',
  'red spring length': 'comprimento da mola vermelha',
  'red spring stiffness': 'rigidez da mola vermelha',
  'rest state': 'estado de repouso',
  'right': 'direita',
  'right gear': 'engrenagem direita',
  'robot': 'robô',
  'rod and spring': 'haste e mola',
  'rod-1 length': 'comprimento da haste 1',
  'rod-2 length': 'comprimento da haste 2',
  'rotational': 'rotacional',
  'round corner': 'canto arredondado',
  'scale x-y together': 'escalar X-Y juntos',
  'separation': 'separação',
  'show energy 2': 'mostrar energia 2',
  'shuttle': 'lançadeira',
  'speed': 'velocidade',
  'spiral': 'espiral',
  'spring 1 length': 'comprimento da mola 1',
  'spring 1 stiffness': 'rigidez da mola 1',
  'spring 2 length': 'comprimento da mola 2',
  'spring 2 stiffness': 'rigidez da mola 2',
  'spring angle': 'ângulo da mola',
  'spring angular velocity': 'velocidade angular da mola',
  'spring length velocity': 'velocidade do comprimento da mola',
  'spring rest length': 'comprimento de repouso da mola',
  'spring type': 'tipo de mola',
  'square': 'quadrado',
  'square blocks': 'blocos quadrados',
  'start angle': 'ângulo inicial',
  'start position': 'posição inicial',
  'start-t': 'tempo inicial',
  'starting gap': 'espaçamento inicial',
  'stick angle': 'ângulo da haste',
  'stick angular velocity': 'velocidade angular da haste',
  'stick length': 'comprimento da haste',
  'stickiness': 'aderência',
  'symmetric': 'simétrico',
  'third spring': 'terceira mola',
  'thrust': 'empuxo',
  'tight fit': 'encaixe justo',
  'time window': 'janela de tempo',
  'track mode': 'modo de trilho',
  'track position': 'posição no trilho',
  'track velocity': 'velocidade no trilho',
  'translational': 'translacional',
  'turning force': 'força de giro',
  'two gears': 'duas engrenagens',
  'two hit one': 'duas atingem uma',
  'two hit one asymmetric': 'duas atingem uma assimétrica',
  'two in box': 'duas na caixa',
  'two on wall': 'duas na parede',
  'two piles': 'duas pilhas',
  'two springs': 'duas molas',
  'velocity 1': 'velocidade 1',
  'velocity 2': 'velocidade 2',
  'velocity-1': 'velocidade 1',
  'velocity-2': 'velocidade 2',
  'vertical-align': 'alinhamento vertical',
  'wall': 'parede',
  'wall size': 'tamanho da parede',
  'wall width': 'largura da parede',
  'walls': 'paredes',
  'wheel': 'roda',
  'wheel mass': 'massa da roda',
  'which path is fastest to slide down?  click a path to begin.':
      'Qual caminho é o mais rápido para deslizar? Clique em um caminho para começar.',
  'width': 'largura',
  'with gears': 'com engrenagens',
  'work from damping': 'trabalho do amortecimento',
  'x position': 'posição X',
  'x velocity': 'velocidade X',
  'x-equation': 'equação X',
  'y position': 'posição Y',
  'y velocity': 'velocidade Y',
  'y-equation': 'equação Y',
  'you picked the': 'você escolheu'
};

/** Translates user-facing control text for the Portuguese site shell. */
static localizeControlLabel(label: string): string {
  if (label.length == 0) {
    return label;
  }
  if (typeof document == 'undefined'
      || !document.documentElement.lang.toLowerCase().startsWith('pt')) {
    return label;
  }
  const trimmed = label.trim();
  const leading = label.substring(0, label.indexOf(trimmed));
  const trailing = label.substring(label.indexOf(trimmed) + trimmed.length);
  const lower = trimmed.toLowerCase();
  const exact = Util.PT_BR_CONTROL_LABELS[lower];
  if (exact !== undefined) {
    return leading + exact + trailing;
  }
  const keys = Object.keys(Util.PT_BR_CONTROL_LABELS)
      .sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (lower.startsWith(key)) {
      const rest = trimmed.substring(key.length);
      if (rest == '' || rest[0] == ' ' || rest[0] == '(' || rest[0] == '[') {
        return leading + Util.PT_BR_CONTROL_LABELS[key] + rest + trailing;
      }
    }
  }
  return label;
};

/** Maximum number of errors to report by {@link setErrorHandler}.
*/
private static readonly maxErrors = 3;

/** Maximum representable integer.  Need to avoid having an index ever
* reach this value because we can then no longer increment by 1.
* That is:  2^53 + 1 == 2^53 because of how floating point works.
*/
static readonly MAX_INTEGER = Math.pow(2, 53);

/** Minimum representable integer.
*/
static readonly MIN_INTEGER = -Math.pow(2, 53);

/** Whether running under a modern browser that supports `performance.now()`;
*/
static readonly MODERN_CLOCK = Util.isObject(performance) &&
    typeof performance.now === 'function';

/** String used to mark functions that have not been implemented.
*/
static readonly NOT_IMPLEMENTED = 'not implemented';

/** Number of errors reported by {@link setErrorHandler}.
*/
private static numErrors = 0;

/** Returns the current version number for the myphysiclab library, using
* [Semantic Versioning](http://semver.org).
*
* Given a version number MAJOR.MINOR.PATCH, increment the:
* + MAJOR version when you make incompatible API changes,
* + MINOR version when you add functionality in a backwards-compatible manner, and
* + PATCH version when you make backwards-compatible bug fixes.
*
* Additional labels for pre-release and build metadata are available as extensions to
* the MAJOR.MINOR.PATCH format.
*
*/
static readonly VERSION = '2.0.0';

/** The default number format to use in `toString` methods.
*/
static NF = Util.nf5;

/** assert throws an error if the test is not true.

TO DO: The idea of assertions is that they disappear when you turn off the ASSERTS
flag. Here they would be disabled with ASSERTS flag false, but the code doesn't
disappear.
@param test whether the assertion is true or false
@param opt_message optional message to print to console if assertion is false
*/
static assert(test: boolean, opt_message?: string) {
  if (Util.ASSERTS && !test) {
    if (opt_message) {
      console.log(opt_message);
    }
    throw "assert failed "+(opt_message ? opt_message: '');
  }
};

/** Converts an array of numbers to a string, with a separator string between each
number.
@param r  the array to print
@param nf  number format function to use
@param separator the text to insert between each value; default is
    a comma and space `, `
@return the array of numbers converted to a string
*/
static array2string(r: number[], nf?: (n:number)=>string, separator?: string) {
  nf = nf ?? Util.NF7E;
  if (separator === undefined) {
    separator = ', ';
  }
  const n = r.length;
  let s = '';
  for (let i=0; i<n; i++) {
    s += (i > 0 ? separator : '') + nf(r[i]);
  }
  return s;
};

/** Converts an array of booleans to string, with commas between each boolean.
* @param r the array to print
* @param trueString the string that indicates a true value; default `true`
* @param falseString the string that indicates a false value; default `false`
* @return the array of booleans converted to a string
*/
static arrayBool2string(r: boolean[], trueString?: string,
    falseString?: string) {
  trueString = trueString || 'true';
  falseString = falseString || 'false';
  const n = r.length;
  let s = '';
  for (let i=0; i<n; i++) {
    s += r[i] ? trueString : falseString;
    if (i<n-1) {
      s += ', ';
    }
  }
  return s;
};

/** Returns a [CSS3 color string](https://www.w3.org/TR/css3-color/#rgb-color)
composed of a `#` followed by 3 hex digits corresponding to given red, green, blue
proportions.
@param red proportion of red from 0.0 to 1.0
@param green proportion of green from 0.0 to 1.0
@param blue proportion of blue from 0.0 to 1.0
@return the corresponding CSS3 color string with 3 hex digits
*/
static colorString3(red: number, green: number, blue: number) {
  let s = '#';
  const colors = [red, green, blue];
  for (let i=0; i<3; i++) {
    s += Util.numToHexChar1(colors[i]);
  }
  Util.assert( s.length == 4 );
  return s;
};

/** Returns a [CSS3 color string](https://www.w3.org/TR/css3-color/#rgb-color)
composed of a `#` followed by 6 hex digits corresponding to given red, green, blue
proportions.
@param red proportion of red from 0.0 to 1.0
@param green proportion of green from 0.0 to 1.0
@param blue proportion of blue from 0.0 to 1.0
@return the corresponding CSS3 color string with 6 hex digits
*/
static colorString6(red: number, green: number, blue: number) {
  let s = '#';
  const colors = [red, green, blue];
  for (let i=0; i<3; i++) {
    s += Util.numToHexChar2(colors[i]);
  }
  Util.assert( s.length == 7 );
  return s;
};

/** Creates an `HTMLImageElement` from the given URL.
* @param url location of the image as a URL
* @param width width of the image in pixels
* @param opt_height  optional height of image in pixels
* @return  an HTMLImageElement
*/
static createImage(url: string, width: number, opt_height?: number) {
  const img = document.createElement('img') as HTMLImageElement;
  img.src = url;
  img.width = width;
  img.height = opt_height !== undefined ? opt_height : width;
  return img;
};

/** Define a global name with a value.
* @param n name of the global
* @param v value of the global
* @param opt_write whether the global is writable
*/
static defineGlobal(n: string, v: any, opt_write?: boolean) {
  Object.defineProperty(globalThis, n, {
    value: v,
    writable: opt_write ? true : false,
  });
};

/** Returns text with specified number of characters removed from start or end of
* string.
* @param text
* @param n  number of characters to drop; if positive the characters are
*     removed from front of string; if negative then from end of string
*/
static drop(text: string, n: number) {
  if (n >= 0) {
    return text.slice(n);
  } else {
    return text.slice(0, text.length+n);
  }
};

/** Returns whether the arrays are equal.
* @param a1 first array
* @param a2 second array
* @return `true` if arrays are same length and have same elements in each position
*/
static equals<T>(a1: T[], a2: T[]): boolean {
  if (a1.length !== a2.length) {
    return false;
  }
  return a1.every((element: T, index: number) => element === a2[index]);
};

/** Executes the function on each member of the array, starting at end of array.
* Note: use arrow function syntax `=>` which which binds current context implicitly
* so you don't need to worry about "this".
* @param a array of arguments
* @param fnc function that takes 3 arguments: an element of the array,
*     the index number, and the array
* @param opt_this the "this" argument when executing the function
*/
static forEachRight<T, K>(a: T[], fnc: (a:T, idx: number, arr: T[])=> void,
    opt_this?: K): void {
  const len = a.length;
  for (let i=len-1; i>=0; i--) {
    fnc.call(opt_this, a[i], i, a);
  }
};

/** Finds the specified element in the HTML Document; throws an error if element
* is not found.
* @param elementId element id of the element in the HTML Document
* @return the element from the current HTML Document
* @throws if element is not found.
*/
static getElementById(elementId: string): HTMLElement {
  const e = document.getElementById(elementId);
  if (e === null) {
    throw 'elementId not found: '+elementId;
  }
  return e;
};

/** Returns the dimensions of the browser viewport.
* @return the width and height of the browser viewport
*/
static getViewportSize(): [number, number] {
  // https://stackoverflow.com/questions/1248081/how-to-get-the-browser-viewport-dimensions
  let vw = Math.max(document.documentElement.clientWidth || 0,
      window.innerWidth || 0);
  let vh = Math.max(document.documentElement.clientHeight || 0,
      window.innerHeight || 0);
  return [vw, vh];
}

/** Returns the length of hypotenuse of right triangle.
* @param a length of a side of the right triangle
* @param b length of other side of the right triangle
* @return length of hypotenuse = sqrt(a^2 + b^2)
*/
static hypot(a: number, b: number) {
  return Math.sqrt(a*a + b*b);
};

/**  Returns `true` if running under Chrome browser.
* @return `true` if running under Chrome browser
*/
static isChrome() {
  const nav = navigator;
  if (nav != null) {
    return nav.userAgent.match(/.*Chrome.*/) != null;
  } else {
    return false;
  }
};

/**  Returns `true` if running on iPhone.
* @return `true` if running on iPhone
*/
static isIPhone() {
  const nav = navigator;
  if (nav != null) {
    return nav.platform == 'iPhone';
  } else {
    return false;
  }
};

/** Returns whether the object is an object.
@return Whether variable is an object.
*/
static isObject(obj: any) {
  return (typeof obj) == 'object' && obj != null;
};

/** Returns the given angle limited to the range -pi to +pi.
@param angle the angle in radians
@return the equivalent angle in the range -pi to +pi
*/
static limitAngle(angle: number) {
  if (angle > Math.PI) {
    const n = Math.floor((angle - -Math.PI)/(2*Math.PI));
    return angle - 2*Math.PI*n;
  } else if (angle < -Math.PI) {
    const n = Math.floor(-(angle - Math.PI)/(2*Math.PI));
    return angle + 2*Math.PI*n;
  } else {
    return angle;
  }
};

/** Finds the specified element in the HTML Document; returns null if element
* is not found.
* @param elementId element id of the element in the HTML Document
* @return the element from the current HTML Document, or null if not found
*/
static maybeElementById(elementId: string): HTMLElement|null {
  try {
    return document.getElementById(elementId);
  } catch (e: unknown) {
    return null;
  }
};

/** Returns list of names of methods (functions) defined on the given object.
* @param obj object to examine
* @return list of names of functions defined on the given object
*/
static methodsOf(obj: object): string[] {
  const s = [];
  let proto = Object.getPrototypeOf(obj);
  while (proto) {
    const nms = Object.getOwnPropertyNames(proto);
    for (let i=0; i<nms.length; i++) {
      let p = nms[i];
      if (p === 'constructor') {
        continue;
      }
      // https://stackoverflow.com/questions/62438346/
      // how-to-dynamically-access-object-property-in-typescript
      if (typeof obj[p as keyof typeof obj] === 'function') {
        s.push(p);
      }
    }
    proto = Object.getPrototypeOf(proto);
    if (proto === null || proto.constructor === Object) {
      break;
    }
  }
  s.sort();
  Util.removeDuplicates(s);
  return s;
};

/** Returns the name of the property with the given value, within the given object.
* @param obj  the object whose values are examined
* @param value the value of interest
* @return the name of the property with the given value, within the object;
*   or the empty string if value not found.
*/
static nameOf(obj: object, value: object): string {
  for (let p in obj) {
    if (obj[p as keyof typeof obj] === value) {
      return p;
    }
  }
  return '';
};

/** Returns a boolean array with all entries initialized to `false`.
* @param n length of array
* @return array of booleans with all entries initialized to `false`.
*/
static newBooleanArray(n: number): boolean[] {
  const a = new Array(n);
  for (let i=0; i<n; i++) {
    a[i] = false;
  }
  return a;
};

/** Returns an array of numbers with all entries initialized to zero.
* @param n length of array
* @return an array of numbers with all entries initialized to zero.
*/
static newNumberArray(n: number): number[] {
  const a = new Array(n);
  for (let i=0; i<n; i++) {
    a[i] = 0;
  }
  return a;
};

/** Formats a number with 0 decimal places.
* @param num the number to format
* @return the number with 0 decimal places; or `null` or `undefined`
*/
static NF0(num: number|null) {
  if (num != null)
    return num.toFixed(0);
  else
    return num === null ? 'null' : 'undefined';
};

/** Formats a number with 18 decimal places.
* @param num the number to format
* @return the number with 18 decimal places; or `null` or `undefined`
*/
static NF18(num: number|null) {
  if (num != null)
    return num.toFixed(18);
  else
    return num === null ? 'null' : 'undefined';
};

/** Formats a number with 1 decimal place and a plus sign if positive.
* @param num the number to format
* @return the number with 1 decimal place and a plus sign if positive;
*    or `null` or `undefined`
*/
static NF1S(num: number|null) {
  if (num != null)
    return (num > 0 ? '+' : '') + num.toFixed(1);
  else
    return num === null ? 'null' : 'undefined';
};

/** Formats a number with 2 decimal places.
* @param num the number to format
* @return the number with 2 decimal places; or `null` or `undefined`
*/
static NF2(num: number|null) {
  if (num != null)
    return num.toFixed(2);
  else
    return num === null ? 'null' : 'undefined';
};

/** Formats a number with 3 decimal places.
* @param num the number to format
* @return the number with 3 decimal places; or `null` or `undefined`
*/
static NF3(num: number|null) {
  if (num != null)
    return num.toFixed(3);
  else
    return num === null ? 'null' : 'undefined';
};

/** Formats a number with 4 decimal places.
* @param num the number to format
* @return the number with 4 decimal places; or `null` or `undefined`
*/
static NF4(num: number|null) {
  if (num != null)
    return num.toFixed(4);
  else
    return num === null ? 'null' : 'undefined';
};

/** Formats a number with 5 decimal places.
* @param num the number to format
* @return the number with 5 decimal places; or `null` or `undefined`
*/
static NF5(num: number|null) {
  if (num != null)
    return num.toFixed(5);
  else
    return num === null ? 'null' : 'undefined';
};

/** Formats a number with 5 decimal places, but if too small then switch
* to exponential.
* @param num the number to format
* @return the number with 5 decimal places; or `null` or `undefined`
*/
static NF5E(num: number|null) {
  if (num != null) {
    if (Math.abs(num) > 2E-4 || num == 0) {
      return num.toFixed(5);
    } else {
      return num.toExponential(5);
    }
  } else {
    return num === null ? 'null' : 'undefined';
  }
};

/** Formats a number with from zero to 5 decimal places.
* @param num the number to format
* @return the number with zero to 5 decimal places; or `null` or `undefined`
*/
static nf5(num: number|null) {
  if (num != null) {
    const s = num.toFixed(5);
    // remove trailing zeros, and possibly decimal point
    return s.replace(/\.?0+$/, '');
  } else {
    return num === null ? 'null' : 'undefined';
  }
};

/** Formats a number with 7 decimal places.
* @param num the number to format
* @return the number with 7 decimal places; or `null` or `undefined`
*/
static NF7(num: number|null) {
  if (num != null)
    return num.toFixed(7);
  else
    return num === null ? 'null' : 'undefined';
};

/** Formats a number with 7 decimal places, but if too small then switch
* to exponential.
* @param num the number to format
* @return the number with 7 decimal places; or `null` or `undefined`
*/
static NF7E(num: number|null) {
  if (num != null) {
    if (Math.abs(num) > 2E-6) {
      return num.toFixed(7);
    } else {
      return num.toExponential(7);
    }
  } else {
    return num === null ? 'null' : 'undefined';
  }
};

/** Formats a number with from zero to 7 decimal places.
* @param num the number to format
* @return the number with zero to 7 decimal places; or `null` or `undefined`
*/
static nf7(num: number|null) {
  if (num != null) {
    const s = num.toFixed(7);
    // remove trailing zeros, and possibly decimal point
    return s.replace(/\.?0+$/, '');
  } else {
    return num === null ? 'null' : 'undefined';
  }
};

/** Formats a number with 9 decimal places.
* @param num the number to format
* @return the number with 9 decimal places; or `null` or `undefined`
*/
static NF9(num: number|null) {
  if (num != null)
    return num.toFixed(9);
  else
    return num === null ? 'null' : 'undefined';
};

/** Formats a number with 7 digit exponential notation.
* @param num the number to format
* @return the number in 7 digit exponential notation; or `null` or `undefined`
*/
static NFE(num: number|null) {
  if (num != null)
    return num.toExponential(7);
  else
    return num === null ? 'null' : 'undefined';
};

/** Formats a number with 17 digit exponential notation.
* @param num the number to format
* @return the number in 17 digit exponential notation; or `null` or `undefined`
*/
static NFSCI(num: number|null) {
  if (num != null)
    return num.toExponential(17);
  else
    return num === null ? 'null' : 'undefined';
};

/**  Maps a number in range 0 to 1 to a single hexadecimal character from 0 to f.
* @param n number between 0 and 1
* @return the number converted to a single hexadecimal character
*/
static numToHexChar1(n: number) : string {
  n = Math.floor(0.5 + 16*n);
  if (n >= 15)
    return 'f';
  else if (n <= 0)
    return '0';
  else {
    return Util.HEX_DIGITS.charAt(n);
  }
};

/**  Maps a number in range 0 to 1 to a two-digit hexadecimal number.
* @param n  number between 0 and 1
* @return  the number converted to a two-digit hexadecimal number
*/
static numToHexChar2(n: number) {
  n = Math.floor(0.5 + 256*n);
  if (n >= 255)
    return 'ff';
  else if (n <= 0)
    return '00';
  else {
    const i = Math.floor(n/16);
    const j = n % 16;
    return Util.HEX_DIGITS.charAt(i) + Util.HEX_DIGITS.charAt(j);
  }
};

/** Formats the `toString` represention of an object to be more readable. Adds
newlines and spaces so that each property of an object appears on a separate line, and
is indented according to the "level depth" of objects being formatted.

Assumes that the object's `toString` is formatted according to Javascript conventions
like this:
```text
ClassName{property1: value1, property2: value2}
```
Semi-colons or commas are equivalent for separating properties. Assumes that arrays
are formatted like standard JavaScript as `[object1, object2, object3]`.

The `level` depth works as follows: Level 1 means that the each property of the
object appears on a separate line preceded a single indent string. For example:
```text
ClassName{
  property1: value1,
  property2: value2,
}
```
Level 2 is like level 1, but additionally any object that appears as the value of a
level 1 property is also expanded:
```text
ClassName{
  property1: ClassName2{
    property3: value3,
    property4: value4
  },
  property2: value2,
}
```
Level 3 adds another level of expansion for objects found at Level 2. And so on for
higher levels.
```text
ClassName{
  property1: ClassName2{
    property3: value3,
    property4: ClassName3{
      property5: value5,
      property6: value6
    }
  },
  property2: value2,
}
```
The "property detection" is done by looking for commas or semicolons.
A new level is begun whenever an opening brace `{` or square bracket `[` is seen.
Anything in quotes is ignored.  Works for arrays also.

**TO DO**  escaped quotes in strings should be ignored.

@param input the string to reformat. Typically this is the
    `toString` representation of an object.
@param level how much nesting of the object to pay attention to. Nesting
    occurs whenever opening braces `{` or brackets `[` are seen in the input string.
    Default is 2.
@param indent String to use for indenting each new level. Default is two
    spaces.
@return the input string formatted to be more readable
*/
static prettyPrint(input: string|object, level?: number, indent?: string): string {
  if (typeof level !== 'number') {
    level = 2;
  }
  if (typeof indent !== 'string') {
    indent = '  ';
  }
  const inp = String(input);
  let out = '';
  let lvl = 0;  // number of unbalanced braces seen
  const n = inp.length;
  let ignoreSpace = false;
  const closeList: string[] = [];
  let closeSymbol = '';
  next_char: for (let i = 0; i<n; i++) {
    let c = inp.charAt(i);
    // we ignore spaces until we find a non-space
    if (ignoreSpace) {
      if (c == ' ') {
        continue;
      } else {
        ignoreSpace = false;
      }
    }
    if (c == '{' || c == '[') {
      lvl++;
      if (lvl <= level) {
        // after every open brace, insert a new line and some spaces
        out += c+'\n';
        // indent according to level
        for (let l=0; l<lvl; l++) {
          out += indent;
        }
        ignoreSpace = true;
      } else {
        // beyond desired level, so just write the open brace
        out += c;
      }
      closeList.push(closeSymbol);
      closeSymbol = (c == '{') ? '}' : ']';
    } else if (c == closeSymbol) {
      if (lvl <= level) {
        lvl--;
        out += '\n';
        // indent according to level
        for (let l=0; l<lvl; l++) {
          out += indent;
        }
        out += c;
      } else {
        // beyond desired level, so just write the close brace
        lvl--;
        out += c;
      }
      const p = closeList.pop();
      if (p === undefined)
        throw 'error in  prettyPrint';
      closeSymbol = p;
      if (lvl < 0)
        throw 'unbalanced '+closeSymbol+' at '+i+' in '+input;
    } else if (c == '"' || c == '\'') {
      const q = c;
      const k = i;  // index of starting quote
      out += c;
      // read entire quoted string
      while (++i < n) {
        c = inp.charAt(i);
        out += c;
        if (c == q) {
          // found balancing quote
          continue next_char;
        }
      }
      throw 'unbalanced quote at '+k+' in '+input;
    } else if ((c == ',' || c == ';') && lvl <= level) {
      // after every comma, insert a new line and some spaces
      out += c+'\n';
      // indent according to level
      for (let l=0; l<lvl; l++) {
        out += indent;
      }
      ignoreSpace = true;
    } else {
      out += c;
    }
  }
  // cludge:  eliminate blank lines (happens with empty arrays).
  out = out.replace(/^\s+\n/gm, '');
  return out;
};

/** Prints array of numbers to `console.log` on multiple lines so that each line
* is no longer than `lineLength`.
* @param array the array to print
* @param lineLength  maximum length of a line, default 80
* @param format  formatting function, default is NF5E
*/
static printArray(array: number[], lineLength?: number,
  format?: (n: number)=> string) {
  if (Util.DEBUG) {
    lineLength = lineLength || 80;
    format = format || Util.NF5E;
    let s = '';
    for (let i=0, len=array.length; i<len; i++) {
      const r = format(array[i]);
      if (s.length + r.length > lineLength) {
        console.log(s);
        s = '  ' + r;  // indent lines after first
      } else {
        s += ' '+ r;
      }
    }
    if (s.length > 0) {
      console.log(s);
    }
  }
};

/** Prints to `console.log` a variable set of numbers using `NF5` format.
@param s prefix to print
@param nums numbers to print, variable number of arguments
*/
static printNums5(s: string, ...nums: number[]) {
  for (let i=0; i<nums.length; i++) {
    const n = nums[i];
    if (typeof n == 'number')
      s += ' '+Util.NF5(n);
  }
  console.log(s);
};

/** Returns list of names of (non-function) properties defined on the given object, and
optionally also shows the values of the properties.
@param obj the object to examine, or null
@param showValues whether to show values of the properties (default is `false`)
@return array of names of properties of the object (and possibly their values)
*/
static propertiesOf(obj: object|null, showValues?: boolean): string[] {
  if (obj === null) {
    return ['null'];
  }
  showValues = showValues || false;
  const s = [];
  for (let p in obj) {
    if (typeof obj[p as keyof typeof obj] === 'function') {
      continue;
    }
    if (showValues) {
      s.push(p+': '+obj[p as keyof typeof obj]);
    } else {
      s.push(p);
    }
  }
  s.sort();
  return s;
};

/** returns array with numbers 0, 1, 2, 3, ..., n-1. */
static range(n: number): number[] {
  const array = [];
  let i = 0;
  while (i < n) {
    array.push(i++);
  }
  return array;
};

/** removes the first occurence of the object from the array.
@param arr the array to remove from
@param myobj the object to remove
@return true if the object was removed
*/
static remove<T>(arr: Array<T>, myobj: T): boolean {
  let i: number;
  const fn = (element: T) => element === myobj;
  if ((i = arr.findIndex(fn)) >= 0) {
    arr.splice(i, 1);
    return true;
  }
  return false;
};

/** removes all copies of the object from the array.
@param arr the array to remove from
@param myobj the object to remove
@return true if the object was removed
*/
static removeAll<T>(arr: Array<T>, myobj: T): boolean {
  let deleted = false;
  Util.forEachRight(arr, (obj: T, idx: number)=> {
    if (obj === myobj) {
      arr.splice(idx, 1);
      deleted = true;
    }
  });
  return deleted;
};

/** remove duplicates from a sorted array.

TO DO: add an assert that the array is sorted
*/
static removeDuplicates<T>(a: T[]): void {
  const n = a.length;
  if (n <= 1) {
    return;
  }
  let e: T = a[0]; // last element examined
  let i = 1; // next slot to read from
  let j = 1; // next slot to write to
  while (i < n) {
    if (a[i] === e) {
      i++;
      continue;
    }
    e = a[i];
    a[j] = e;
    i++;
    j++;
  }
  a.length = j;
};

/** Returns an array of the specified length with the given value repeated.
@param value the value to repeat
@param len length of array to create
@return array with the given value repeated
*/
static repeat<T>(value: T, len: number): T[] {
  const arr = [];
  let i = 0;
  while (i++ < len) {
    arr.push(value);
  }
  return arr;
};

/** Sets a global error handler function in `window.onerror` to alert user.
*/
static setErrorHandler(): void {
  window.onerror = function(msg, url, line, colno, err) {
    const s = msg + '\n' + url + ':' + line + ':' + colno + '\n' + err;
    Util.showErrorAlert(s);
  }
  // Check that assertions are working.
  if (Util.DEBUG) {
    let a = 1;
    try {
      Util.assert(false);
      a = 2;
    } catch(e: unknown) {
      console.log('asserts are working');
    }
    if (a == 2) {
      throw 'asserts are not working';
    }
  } else if (Util.DEBUG) {
    console.log('WARNING: asserts are NOT enabled!');
  }
};

/** Specifies the relative URL of the directory containing images related to the user
* interface.  The value is accessible via {@link IMAGES_DIR}.
* @param images_dir the relative URL of the images directory;
*     if undefined `IMAGES_DIR` is not changed.
*/
static setImagesDir(images_dir?: string) {
  if (images_dir !== undefined) {
    Util.IMAGES_DIR = images_dir;
  } else {
    throw 'images directory not found';
  }
};

/** Shows an error alert to user, but only if not too many error alerts have
been shown already. This avoids user being stuck in infinite loop of error
alerts.
@param s text to show in alert
*/
static showErrorAlert(s: string): void {
    if (Util.DEBUG) {
      console.log(s);
    }
    if (Util.numErrors++ < Util.maxErrors) {
      alert(s);
    }
};

/** Returns the current time as given by the system clock, in seconds.
* @return the current time as given by the system clock, in seconds
*/
static systemTime(): number {
  if (Util.MODERN_CLOCK) {
    // use high resolution time if available and not running tests with mock clock
    return performance.now()*1E-3;
  } else {
    return Date.now()*1E-3;
  }
};

/** Returns specified number of characters from start or end of string.
* @param text
* @param n  number of characters to take; if positive the characters are
*     taken from front of string; if negative then from end of string
*/
static take(text: string, n: number): string {
  if (n == 0) {
    return '';
  } else if (n > 0) {
    return text.slice(0,n);
  } else {
    return text.slice(text.length+n, text.length);
  }
};

/** Throws an error if the argument is not a finite number.
* @param value the number to test
* @return the value that passed the test
* @throws if the argument is not a finite number
*/
static testFinite(value: number): number {
  if (!isFinite(value)) {
    throw 'not a finite number '+value;
  }
  return value;
};

/** Throws an error if the argument is not a number.
* @param value the number to test
* @return the value that passed the test
* @throws if the argument is not a number
*/
static testNumber(value: number): number {
  if (isNaN(value)) {
    throw 'not a number '+value;
  }
  return value;
};

/** Returns the
* [language independent form](../Building.html#languageindependentnames) of the given
* string by changing to uppercase and replacing spaces and dashes with underscores.
* @param text the text to convert
* @return the text upper-cased and with spaces and dashes replaced by underscores
*/
static toName(text: string): string {
  return text.toUpperCase().replace(/[ -]/g, '_');
};

/** Whether all elements of the array are unique with no duplicates.
* @param arr the array to examine
* @return Whether all elements of the array are unique with no duplicates.
*/
static uniqueElements(arr: string[]): boolean {
  const len = arr.length;
  if (len > 1) {
    // make a copy so that we don't modify the passed-in array
    const a = arr.slice();
    a.sort();
    let last = a[0];
    for (let i=1; i<len; i++) {
      if (last == a[i]) {
        return false;
      }
      last = a[i];
    }
  }
  return true;
};

/** Ensures the given text consists of only uppercase letters, numbers and underscore
* and first character is a letter or underscore. This is required for
* [language independent names](../Building.html#languageindependentnames).
* @param text the text to validate
* @return the validated text
* @throws if text does not qualify as a name
*/
static validName(text: string): string {
  if (!text.match(/^[A-Z_][A-Z_0-9]*$/)) {
    throw 'not a valid name: '+text;
  }
  return text;
};

/** Returns `true` if the numbers are significantly different to a certain tolerance
level, adjusting the tolerance for larger numbers.

For numbers with absolute value smaller than `magnitude` the numbers are compared using
a fixed tolerance of `magnitude*epsilon`.

For numbers with absolute value larger than `magnitude`, the tolerance is
`epsilon` times the larger of the absolute values of the numbers being compared.

Unless specified, the default for `magnitude` is 1.0 and `epsilon` is 1E-14. These
settings return `true` if the numbers are significantly different to approximately 14
decimal digits when their magnitude is near 1.0.

The goal is to have a test that is immune to the inaccuracy of double arithmetic.
Doubles have 15 to 17 significant decimal digits of accuracy, so comparing 14
significant digits should be fairly safe from the inaccuracy in double arithmetic.

This method takes into account the size of the numbers being compared, so it is
safer than code such as

    if (Math.abs(a - b) > 1E-16)  // do something

Doubles have 15 to 17 significant decimal digits of accuracy. When the numbers being
compared are much bigger in magnitude than 1.0, then this test is too strict -- it
effectively is comparing to zero, meaning exact equality.

See [Comparing Floating Point Numbers, 2012 Edition](https://randomascii.wordpress.com/2012/02/25/comparing-floating-point-numbers-2012-edition/) by Bruce Dawson.

See [StackOverflow: How dangerous is it to compare floating point values?](http://stackoverflow.com/questions/10334688/how-dangerous-is-it-to-compare-floating-point-values)

@param arg1 the first number to compare
@param arg2 the second number to compare
@param epsilon the small value used with `magnitude` to calculate the tolerance
    for deciding when the numbers are different, default is 1E-14.
@param magnitude the approximate magnitude of the numbers being compared,
    default is 1.0.
@return true if the doubles are different to 14 significant decimal digits
@throws if `magnitude` or `epsilon` is negative or zero
*/
static veryDifferent(arg1: number, arg2: number, epsilon?: number, magnitude?: number)
   : boolean {
  epsilon = epsilon || 1E-14;
  if (!(isFinite(arg1) && isFinite(arg2))) {
    throw 'argument is NaN';
  }
  if (epsilon <= 0) {
    throw 'epsilon must be positive '+epsilon;
  }
  magnitude = magnitude || 1.0;
  if (magnitude <= 0) {
    throw 'magnitude must be positive '+magnitude;
  }
  const maxArg = Math.max(Math.abs(arg1), Math.abs(arg2));
  const max = maxArg > magnitude ? maxArg : magnitude;
  return Math.abs(arg1 - arg2) > max * epsilon;
};

/** Sets all values of array to zero
* @param arr the array to modify
*/
static zeroArray(arr: number[]): void {
  const n = arr.length;
  for (let i=0; i<n; i++) {
    arr[i] = 0;
  }
};

} // end class

Util.defineGlobal('lab$util$Util', Util);
