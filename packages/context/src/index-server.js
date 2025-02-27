import * as React from 'react';
import { getValue } from '@joy/styling-engine-context/getValue';

export const useContext = React.cache(getValue);
