import { Output } from '@bitspace/circuit';
import { min } from '@thi.ng/shader-ast';
import { combineLatest, map } from 'rxjs';

import { PrimSchema } from '../../../schemas/Prim/Prim';
import { ABPrimNode } from '../../internal/ABPrimNode/ABPrimNode';

export class Minimum extends ABPrimNode {
    static displayName = 'Minimum';

    outputs = {
        output: new Output({
            name: 'Output',
            type: PrimSchema(),
            observable: combineLatest([this.inputs.a, this.inputs.b]).pipe(map(inputs => min(...inputs)))
        })
    };
}
