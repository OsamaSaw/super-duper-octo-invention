export const  selectTheme = (theme) => ({
    ...theme,
    colors: {
    ...theme.colors,
      text: 'black',
      primary25: 'gray',
      primary: '#45a049',
      neutral0:"#2E374A"
    },
  })
  export const selectStyle ={
    control: (provided) => ({
      ...provided,
      border: 0, // Remove the border
      outline: 'none',
      
  }),
    option: (provided, state) => ({
      ...provided,
      color: 'white', // Set the text color for options
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'white', // Set the text color for the selected value
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'white', // Set the color for the placeholder text
}),
  }