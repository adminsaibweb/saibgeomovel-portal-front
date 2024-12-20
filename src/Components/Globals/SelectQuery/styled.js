import styled, { keyframes, css } from 'styled-components';

export const Container = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem !important;

  width: 100%;
  /* height: 100vh; */

  div:nth-child(1) {
    width: 100% !important;
  }

  div.divSuper {
    position: ${(props) => props.enableDivSuper && 'absolute'};
    height: ${(props) => props.enableDivSuper && '100vh'};
    top: 0;
    width: ${(props) => props.enableDivSuper && '100vw'};
    background: ${(props) => (props.enableDivSuper ? '#f00' : 'transparent')};
  }

  border-bottom: 1px solid #ccc;
  /* border: ${(props) => (props.focused ? '1.1px solid rgba(73, 70, 226, 0.46) !important;' : 'none')}; */
  /* -webkit-box-shadow: ${(props) => (props.focused ? '0px 0px 3px 2px rgb(73 70 226 / 46%) !important;' : 'none')}; */
`;

export const ContentLoading = styled.div`
  width: 3%;
  display: flex;
  align-items: center;

  ${({ loading }) =>
    loading === 'true'
      ? css`
          .material-icons {
            animation: ${rotate} 2s linear infinite;
            display: block;
            color: rgb(189, 32, 123);
            font-size: 1.4rem;
            top: 1px;
          }
        `
      : css`
          .material-icons {
            animation: unset;
            display: none;
            color: rgb(189, 32, 123);
            font-size: 1.4rem;
          }
        `};
`;

export const ContentInput = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  border-bottom: 1px solid #ccc;
  border: ${(props) => (props.focused ? '1.1px solid rgba(73, 70, 226, 0.46) !important;' : 'none')};
  -webkit-box-shadow: ${(props) => (props.focused ? '0px 0px 3px 2px rgb(73 70 226 / 46%) !important;' : 'none')};

  input {
    border-bottom: none !important;
    margin: 0 !important;
    color: #000 !important;
  }

  input:focus {
    border: none !important;
    box-shadow: none !important;
  }
  /* :focus { */
  /* border: 1.1px solid rgba(73, 70, 226, 0.46) !important; */
  /* -webkit-box-shadow: 0px 0px 3px 2px rgb(73 70 226 / 46%) !important; */
  /* } */

  input {
    border-bottom: none !important;
    margin: 0 !important;
  }

  input:focus {
    border: none !important;
    box-shadow: none !important;
  }
`;

export const Input = styled.input`
  display: block !important;
  color: #000 !important;
`;

export const Ul = styled.ul`
  width: 100%;
  max-height: 400px;
  overflow-y: auto;

  display: ${(props) => props.display};
  box-shadow: 0 2px 2px 0 rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 12%), 0 1px 5px 0 rgb(0 0 0 / 20%);

  position: absolute;
  z-index: 100;
  background: #fff;

  li {
    padding: 7px 5px;
    font-size: 16px;
    cursor: pointer;
  }
`;

export const DivDetalhe = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-direction: column;
  padding: 0px 0px 5px 10px;
  text-align: left;
  line-height: 0.9rem;
  flex: ${(props) => (props.flex === undefined ? 'unset' : props.flex)};
  /* margin: 0px 5px 0px 5px; */
  button {
    background: #fff !important;
    color: #000 !important;
    border: none !important;

    padding-right: 0 !important;

    :focus {
      box-shadow: none !important;
    }
  }
`;

export const ContentData = styled.div`
  position: relative;
`;

export const EachItem = styled.div`
  background: ${(props) => (props.isHighlighted ? (props.colorPrimary ? '#8e44ad' : '#bf1f7c') : '#fff')};
  color: ${(props) => (props.isHighlighted ? '#fff' : '#858585')};
  padding: 8px 5px;
  cursor: pointer;
`;

const rotate = keyframes`
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
`;
