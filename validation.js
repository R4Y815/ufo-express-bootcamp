export function checkNullEntry(formData) {
  for(let i = 0; i < Object.keys(formData).length; i += 1) {
    console.log('Loop number = ', i);
    console.log(Object.values(formData)[`${i}`]);
    if(Object.values(formData)[`${i}`].length === 0) {
      console.log('Input form has at least 1 blank in some fields');
      return 2;
    }
  } 
    console.log('All fields filled up');
    return 1;
};

/* export function checkNullEntry2(formData) {

if ( )

}; */