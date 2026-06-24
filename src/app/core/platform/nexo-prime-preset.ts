import base from '@primeuix/themes/aura/base';
import button from '@primeuix/themes/aura/button';
import datepicker from '@primeuix/themes/aura/datepicker';
import floatlabel from '@primeuix/themes/aura/floatlabel';
import inputnumber from '@primeuix/themes/aura/inputnumber';
import inputtext from '@primeuix/themes/aura/inputtext';
import message from '@primeuix/themes/aura/message';
import password from '@primeuix/themes/aura/password';
import select from '@primeuix/themes/aura/select';
import tag from '@primeuix/themes/aura/tag';
import textarea from '@primeuix/themes/aura/textarea';
import css from '@primeuix/themes/aura/css';

const NexoPrimePreset = {
  ...base,
  components: {
    button,
    datepicker,
    floatlabel,
    inputnumber,
    inputtext,
    message,
    password,
    select,
    tag,
    textarea
  },
  css
};

export default NexoPrimePreset;
