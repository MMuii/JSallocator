import React, { useEffect } from 'react';
import { useTerminal } from '../hooks/useTerminal';
import { useHeap } from '../hooks/useHeap';
import Heap from '../components/Heap';
import Terminal from '../components/Terminal';
import Div100vh from 'react-div-100vh';

import '../scss/main.scss';

const IndexPage = () => {
    const [heap, sizes, settings, dispatch] = useHeap();
    const [terminal, log, clearTerminal] = useTerminal();
    
    useEffect(() => {
        console.table(heap);
    }, [heap]);

    return (
        <Div100vh className="container">
            <div className="wrapper">
                <Terminal 
                    heap={heap}
                    sizes={sizes}
                    settings={settings}
                    dispatch={dispatch}
                    terminal={terminal}
                    log={log}
                    clearTerminal={clearTerminal}
                />

                <Heap 
                    heap={heap}
                    sizes={sizes}
                    addressBase={settings.addressBase}
                />
            </div>
        </Div100vh>
    )
}

export default IndexPage;
