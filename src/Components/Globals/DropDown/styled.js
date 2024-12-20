import styled from 'styled-components';

export const Label = styled.label``;

export const ButtonDropdown = styled.button`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  /* color: #fff; */
  /* margin-top: 5px; */
  /* margin-right: 10px; */
  /* width: 100px; */
  /* height: 40px; */
  /* background: ${(props) => (props.backgroundIsPrimary ? '#7e3a9d!important; ' : '#bd207b!important; ')}; */
  /* border-radius: 10px; */
  border: none;
`;

export const LI = styled.li`
  display: flex;
  flex-direction: column;
  justify-content: start;
  text-decoration: none;
  padding: 10px;
  z-index: 101;
  label {
    display: flex;
    flex-direction: column;
    justify-content: start;
    text-decoration: none;
    align-items: flex-start;
    z-index: 101;
    text-shadow: 900;
    font-size: 1rem;
    color: #858585;
  }

  :hover {
    label {
      color: #fff;
    }

    background: #7e3a9d;
    text-shadow: 600;
  }
`;

export const NavBar = styled.div`
  position: relative;

  div.boxFullSize {
    cursor: pointer;
    display: ${(props) => props.display};
    background: transparent;
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    z-index: 100;
    left: 0;
  }
`;

export const Span = styled.span`
  align-items: center;
`;

export const UL = styled.ul`
  position: ${(props) => (props.showOption === true ? 'absolute' : 'none')};
  top: 30px;
  width: max-content;
  height: auto;
  overflow: hidden;
  text-align: center;
  transition: height 0.4s ease;
  background-color: #fff;
  box-shadow: -1px 1px 5px 1px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  float: right;
  z-index: 101;
  a {
    color: black;
  }
`;

export const Input = styled.input`
  position: relative;
  z-index: 101;
  opacity: 0;
  height: 0px;
  [type='checkbox']:checked {
    UL {
      display: block;
      background: red;
      height: 300px;
    }
  }
`;

export const Container = styled.div`
  /* position: relative; */
`;

export const ContentChild = styled.div`
  position: relative;
  width: max-content;

  button.closeDropDown {
    /* display: ${(props) => (props.display !== 'none' ? 'block' : 'none')}; */
    position: absolute;
    right: 10px;
    top: 0;
    padding: 5px !important;
    background: #bd207b !important;
    border: 1px solid #bd207b !important;
  }
`;
