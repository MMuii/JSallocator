import React, { useRef, useEffect, useState } from 'react';

const Heap = ({ heap, sizes, addressBase }) => {
    const [isOverflowing, setOverflowing] = useState(false);
    const containerRef = useRef();

    useEffect(() => {
        const { offsetHeight, scrollHeight } = containerRef.current;
        setOverflowing(offsetHeight < scrollHeight);
    }, [heap, containerRef]);

    const address = num => (addressBase === 'dec') ? num : '0x' + num.toString(16).toUpperCase(); 

    const renderHeap = () => {
        return heap.map(block => {
            return (
                <div 
                    className="block__container"
                    key={block.name} 
                >
                    {(block.next && block.secondFenceEnd !== block.next.structStart) && 
                        <div className="block__free-space">
                            free space: {block.next.structStart - block.secondFenceEnd} bytes
                        </div>
                    }

                    {block.free 
                        ? <div className="block__fence--freed" />
                        : (
                            <div className="block__fence block__fence--second">
                                <p>fence - {sizes.FENCE_SIZE} bytes</p>
                                <div className="block__address block__address--top">{address(block.secondFenceEnd)}</div>
                                <div className="block__address block__address--bot">{address(block.secondFenceStart)}</div>
                            </div>
                        )
                    }

                    <div className="block__wrapper">
                        <div className="block__info">   
                            <p>name: {block.name}</p>
                            <p>size: {block.size}</p>
                            <p>free: {block.free ? 'true' : 'false'}</p>
                        </div>
                    </div>

                    {block.free
                        ? <div className="block__fence--freed" /> 
                        : (
                            <div className="block__fence block__fence--first">
                                <p>fence - {sizes.FENCE_SIZE} bytes</p>
                                <div className="block__address block__address--top">{address(block.blockStart)}</div>
                                <div className="block__address block__address--bot">{address(block.firstFenceStart)}</div>
                            </div>
                        )
                    }

                    <div 
                        className="block__control-struct"
                        style={{ minHeight: sizes.BLOCK_STRUCT_SIZE }}
                    >
                        <p>control struct - {sizes.STRUCT_SIZE} bytes</p>
                        <div className="block__address block__address--bot">
                            {(block.prev && !block.prev.free && block.prev.secondFenceEnd === block.structStart) 
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