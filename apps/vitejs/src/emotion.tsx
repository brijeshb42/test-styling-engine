import styled, { StyledTags } from '@emotion/styled';

import { getCss, NUM_OF_ITEMS } from './common';

const components: ReturnType<StyledTags['button']>[] = [];

for (let i = 0; i < NUM_OF_ITEMS; i++) {
  const { result } = getCss(i);
  components.push(styled.button(result[0]));
}

export { components };
