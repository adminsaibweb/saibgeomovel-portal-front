import styled, { keyframes, css } from 'styled-components';

const rotate = keyframes`
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
`;

export const JanelaWaitScreen = styled.div`
  display: ${(props) =>
    (props.loading === 'undefined' || props.loading === 'true')
      ? 'flex'
      : 'none'};
  position: fixed;
  height: 100vh;
  width: 100vw;
  top: 0px;
  left: 0px;
  background-color: #00000069;
  z-index: 11;
  flex-direction: column;
  /* justify-content: center; */
  h5 {
    text-align: center;
    font-weight: 500;
    color: #f3f3f3;
  }
  .loadingSpiner{
    margin-top: 50%!important;
    margin-left: 42%!important;
  }
`;

export const Loader = styled.div`
  border: 8px solid #f3f3f3; /* Light grey */
  border-top: 8px solid #8e44ad; /* Blue */
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  margin: auto!important;
  ${(props) =>
    props.loading === 'true' &&
    css`
      animation: ${rotate} 2s linear infinite;
    `}
`;
