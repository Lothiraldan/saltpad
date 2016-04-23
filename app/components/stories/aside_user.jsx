import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import UserPart from '../aside/user';

storiesOf('UserPart', module)
  .add('simple', () => (
    <UserPart user={{username: "toto"}}/>
  ));
