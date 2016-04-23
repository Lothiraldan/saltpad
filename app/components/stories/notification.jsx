import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import {JobRunNotification} from '../notification';

let job = {
    Minions: ["Minion1", "Minion2"],
    Result: {"Minion1": {}},
    id: "1060656561",
    Function: "state.highstate",
    Target: "*",
    StartTime: 1460126320
}

storiesOf('JobRunNotification', module)
  .add('simple', () => (
    <JobRunNotification job={job}/>
  ));
