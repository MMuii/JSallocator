import React from 'react';

import './src/scss/main.scss';
import Layout from './src/components/Layout';

export const wrapPageElement = ({ element, props }) => {
    return <Layout {...props}>{element}</Layout>;
}