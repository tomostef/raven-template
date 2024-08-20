import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data, thermometer } from './data/resource';

defineBackend({
  auth,
  data,
  thermometer
});
