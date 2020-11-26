import React, { useEffect } from 'react';
import { useTerminal } from '../hooks/useTerminal';
import { useHeap } from '../hooks/useHeap';
import Heap from '../components/Heap';
import Terminal from '../components/Terminal';
import Div100vh from 'react-div-100vh';

const IndexPage = () => {
    const [heap, debug, sizes, settings, dispatch] = useHeap();
    const [terminal, log, clearTerminal] = useTerminal();
    
    useEffect(() => {
        console.table(heap);
    }, [heap]);

    // useEffect(() => {
    //     console.log('history', history);
    // }, [history])

    useEffect(() => {
        const listener = e => {
            if (e.key === 'q') {
                console.log('debug', debug)
            }
        }

        document.addEventListener('keypress', listener);
        
        return () => document.removeEventListener('keypress', listener);
    });

    return (
        <Div100vh className="container">
            <Terminal 
                heap={heap}
                settings={settings}
                dispatch={dispatch}
                terminal={terminal}
                log={log}
                clearTerminal={clearTerminal}
            />

            <Heap 
                heap={heap}
                sizes={sizes}
                scale={settings.scale}
                addressBase={settings.addressBase}
            />
        </Div100vh>
    )
}

export default IndexPage;
