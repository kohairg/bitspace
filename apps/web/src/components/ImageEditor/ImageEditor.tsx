import clsx from 'clsx';
import {
    ComponentProps,
    MouseEventHandler,
    forwardRef,
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react';
import { Position } from '../../circuit';

const SIZE = 226;

export interface ImageEditorProps extends ComponentProps<'div'> {
    imageUrl: string;
    onImageChange: (imageUrl: string) => void;
}

export const ImageEditor = forwardRef<HTMLDivElement, ImageEditorProps>(
    ({ className, imageUrl, onImageChange, ...props }, ref) => {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const [isDrawing, setIsDrawing] = useState(false);
        const [lastPoint, setLastPoint] = useState<Position>();

        const loadImage = useCallback(
            (image: CanvasImageSource, ctx: CanvasRenderingContext2D) => () => {
                ctx.globalCompositeOperation = 'source-over';
                ctx.drawImage(image, 0, 0);

                ctx.fillStyle = 'red';
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 0;
                ctx.globalCompositeOperation = 'destination-out';
            },
            []
        );

        useEffect(() => {
            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');

                if (!ctx) return;

                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = imageUrl;
                img.onload = loadImage(img, ctx);
            }
        }, [imageUrl, loadImage]);

        const handleMouseMove: MouseEventHandler = useCallback(
            e => {
                if (!isDrawing || !lastPoint || !canvasRef.current) return;

                const ctx = canvasRef.current.getContext('2d');

                if (!ctx) return;

                var bounds = e.currentTarget.getBoundingClientRect();
                var x = e.clientX - bounds.left;
                var y = e.clientY - bounds.top;

                var currentPoint = { x, y };

                ctx.beginPath();
                ctx.arc(x, y, 33, 0, Math.PI * 2, false);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                setLastPoint(currentPoint);
            },
            [isDrawing, lastPoint]
        );

        const handleMouseDown: MouseEventHandler = useCallback(
            e => {
                setIsDrawing(true);
                setLastPoint({ x: e.clientX, y: e.clientY });
            },
            [setIsDrawing, setLastPoint]
        );

        const handleMouseUp = useCallback(async () => {
            setIsDrawing(false);
            setLastPoint(undefined);

            if (!canvasRef.current) return;

            const ctx = canvasRef.current.getContext('2d');

            if (!ctx) return;

            convertJPGToPNG(imageUrl, imageBlob => {
                canvasRef.current?.toBlob(maskBlob => {
                    const formData = new FormData();
                    formData.append('prompt', 'A man with a hat');
                    formData.append('image', imageBlob as Blob);
                    formData.append('mask', maskBlob as Blob);

                    fetch('/api/ai/image_edit', {
                        method: 'POST',
                        body: formData
                    })
                        .then(response => response.json())
                        .then(onImageChange);
                });
            });
        }, [setIsDrawing, setLastPoint, imageUrl, onImageChange]);

        return (
            <div
                ref={element => {
                    if (ref) {
                        if (typeof ref === 'function') {
                            ref(element);
                        } else {
                            ref.current = element;
                        }
                    }

                    window.addEventListener('mouseup', handleMouseUp);

                    return () => {
                        window.removeEventListener('mouseup', handleMouseUp);
                    };
                }}
                className={clsx('relative flex flex-col', className)}
                {...props}
            >
                <canvas
                    ref={canvasRef}
                    className="cursor-[url('/brush.svg')_37_37,auto]"
                    width={SIZE}
                    height={SIZE}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                />
            </div>
        );
    }
);

function convertJPGToPNG(jpgUrl: string, callback: BlobCallback) {
    var img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = SIZE;
        canvas.height = SIZE;

        var ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);

        // Convert the image to PNG format
        canvas.toBlob(callback, 'image/png');
    };

    img.src = jpgUrl;
}
