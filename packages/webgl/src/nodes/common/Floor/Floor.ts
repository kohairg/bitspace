import { Output } from '@bitspace/circuit';
import { abs, add, ceil, floor } from '@thi.ng/shader-ast';
import { combineLatest, lastValueFrom, map } from 'rxjs';

import { PrimSchema } from '../../../schemas/Prim/Prim';
import { ABPrimNode } from '../../internal/ABPrimNode/ABPrimNode';
import { InputPrimNode } from '../../internal/InputPrimNode/InputPrimNode';

export class Floor extends InputPrimNode {
    static displayName = 'Floor';

    outputs = {
        output: new Output({
            name: 'Output',
            type: PrimSchema,
            observable: this.inputs.input.pipe(map(floor))
        })
    };
}
