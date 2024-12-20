import styled from 'styled-components';


export const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const LateralEsquerda = styled.div`
  img{
    z-index: 1;
  }
  background: linear-gradient(to right, #99979880, #403a3e00);
  height: 100vh;
  width: 100%;
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  padding-right: 20px;
  @media only screen and (min-width: 601px) {
    display: flex;
  }
  h5 {
    color: #999798;
    text-transform: capitalize;
    font-size: 2rem;
    font-weight: 900;
    margin-right: 40px;
    text-align: right;
  }
`;

export const LateralDireita = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const LoginForm = styled.div`
  border-radius: 4px;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
  max-width:300px;
  padding: 30px;
  max-height: 550px;
  width: 100%;
  h5{

  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  i{
    color: #8e44ad;
  }
  h6{
    color: #bf1f7c;
    text-align: center;
    font-weight: 900;
  }
  p {
    display:  ${props => ( (props.error!=="") ? "block" : "none")};
    color: #ff3333;
    margin-bottom: 15px;
    border: 1px solid #ff3333;
    padding: 10px;
    width: 100%;
    text-align: center;
    margin-top: 20px;
  }
  input, select{
        width:100%;
        border: 1px solid #eee;
        padding: 10px 15px;
        border-radius: 4px;
        font-size: 16px;
        margin-bottom: 10px;
  }
  a{
    background: #8e44ad;
    border: 1px solid #8e44ad;
    border-radius: 100px;
    color: #ffffff;
    display: inline-block;
    font-family: "Roboto";
    font-size: 16px;
    font-style: normal;
    letter-spacing: 0.4px;
    font-weight: 600;
    font-style: normal;
    letter-spacing: 0.4px;
    line-height: normal;
    padding: 8px 24px;
    text-align: center;
    width: 100%;

    &[disabled]{
        cursor: not-allowed;
        opacity: 0.6;
    }

    :focus {
      background: #8e44ad;
      opacity: 0.8;
    }
  }

`;
