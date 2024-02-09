import { Input, Output } from '@bitspace/circuit';
import { observer } from 'mobx-react-lite';
import {
    ChangeEventHandler,
    FocusEventHandler,
    KeyboardEventHandler,
    useCallback,
    useEffect,
    useMemo,
    useState
} from 'react';
import { withLatestFrom } from 'rxjs';

export interface ControlProps {
    port: Input | Output;
    disabled?: boolean;
    onBlur?: (value: any) => void;
}

export const Control = observer(({ port, disabled, onBlur }: ControlProps) => {
    const [value, setValue] = useState<any>();

    useEffect(() => {
        const subscription = port.subscribe(value => {
            setValue(value);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [port]);

    const handleKeydown: KeyboardEventHandler<HTMLInputElement> = useCallback(e => {
        e.stopPropagation();
    }, []);

    const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
        e => {
            if (port.type.name === 'Number') {
                port.next(port.type.validator.parse(parseFloat(e.target.value)));
            }
        },
        [port]
    );

    const handleBlur: FocusEventHandler<HTMLInputElement> = useCallback(
        e => {
            if (port.type.name === 'Number') {
                onBlur?.(port.type.validator.parse(parseFloat(e.target.value)));
            }
        },
        [onBlur]
    );

    return (
        <input
            className="px-2 py-1 border rounded-md border-slate-200 w-full"
            type="number"
            step={0.01}
            placeholder={port.type.name}
            onKeyDown={handleKeydown}
            value={value}
            disabled={disabled}
            onChange={handleChange}
            onBlur={handleBlur}
        />
    );
});
