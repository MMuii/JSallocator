import React, { useRef, useEffect, useState } from 'react';

const minHeight = 75;
const maxHeight = 500;

const Heap = ({ heap, scale, sizes, addressBase }) => {
    const [isOverflowing, setOverflowing] = useState(false);
    const containerRef = useRef();

    useEffect(() => {
        const { offsetHeight, scrollHeight } = containerRef.current;
        setOverflowing(offsetHeight < scrollHeight);
    }, [heap, containerRef]);

    const calculateSize = size => {
        const res = size * scale;
        if (res > maxHeight) return maxHeight;
        if (res < minHeight) return minHeight;
        return res;
    }

    const address = num => (addressBase === 'dec') ? num : '0x' + num.toString(16).toUpperCase(); 

    const renderHeap = () => {
        return heap.map(block => {
            return (
                <div 
                    className="block__container"
                    key={block.name} 
                >
                    <div className="block__fence block__fence--second">
                        fence
                        <div className="block__address block__address--top">{address(block.secondFenceEnd)}</div>
                        <div className="block__address block__address--bot">{address(block.secondFenceStart)}</div>
                    </div>

                    <div className="block__wrapper">
                        <div 
                            className="block__info"
                            style={{ minHeight: calculateSize(block.size) }}
                        >   
                            <p>name: {block.name}</p>
                            <p>size: {block.size}</p>
                            <p>free: {block.free ? 'true' : 'false'}</p>
                        </div>
                    </div>

                    <div className="block__fence block__fence--first">
                        fence
                        <div className="block__address block__address--top">{address(block.blockStart)}</div>
                        <div className="block__address block__address--bot">{address(block.firstFenceStart)}</div>
                    </div>

                    <div 
                        className="block__control-struct"
                        style={{ minHeight: sizes.BLOCK_STRUCT_SIZE }}
                    >
                        <p>control struct</p>
                        <div className="block__address block__address--bot">
                            {(block.prev && block.prev.secondFenceEnd === block.structStart) 
                                ? '' 
                                : address(block.structStart)}
                        </div>
                    </div>
                </div>
            )
        });
    }
    
    return (
        <div className="heap">
            <div className={`heap__container ${isOverflowing ? 'overflowing' : ''}`} 
                 ref={containerRef}
            >
                <div className="block__container">
                    <div className="block__wrapper">
                        <div className="block--bottom" />
                    </div>
                </div>

                {renderHeap()}        
            </div>
            <div className="heap__border" />
        </div>
    )
}

export default Heap;