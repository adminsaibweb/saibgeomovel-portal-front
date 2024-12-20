import styled from 'styled-components';

export const Container = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  /* background-color: rgba(0, 0, 0, 0.41); */

  /* width: 100vw; */
  margin-right: 0;
  height: 100vh;
  top: 0px;
  left: ${(props) => props.isMobile && '0px'};
  right: ${(props) => !props.isMobile && '0px'};
  z-index: 4;
  width: ${(props) => (props.isMobile ? ' 100vw ' : 'calc(100vw - 64px)')};
`;

export const Box = styled.div`
  background-color: rgba(0, 0, 0, 0.41);
  width: 100%;
  height: 100%;
`;
export const DivImage = styled.div`
  /* position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%); */
  ${(props) =>
    !props.withNavigation &&
    `position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);`}

  /* width: 85%; */
  height: ${(props) => (!props.isMobile ? 'unset' : '90%')};

  position: relative;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  img {
    max-width: ${(props) => (props.orientation === 90 ? 'unset' : '92%')};
    max-height: ${(props) => (props.orientation === 90 ? '85vh' : '95%')};
    height: ${(props) => !props.orientation === 90 && 'max-content'};
    width: ${(props) => !props.orientation === 90 && 'max-content'};

    position: relative;
  }
`;

export const ContentNavigation = styled.div`
  height: ${(props) => (!props.isMobile ? '75%' : 'max-content')};
  width: ${(props) => (props.isMobile ? '100%' : 'calc(100% - 57px)')};
  /* background: #000; */

  display: flex;
  justify-content: center;

  position: fixed;
  left: ${(props) => (props.isMobile ? '50%' : '52%')};
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;

  p {
    color: #fff;
    background: #bd207b;
    border-radius: 0 0 5px 5px;
    padding: 5px;
    text-transform: capitalize !important;

    align-self: center;
    width: ${(props) => (props.orientation === 90 ? '100%' : '92%')};
    max-width: ${(props) => (props.orientation === 90 ? '100%' : '92%')};
    font-weight: 500;
    font-size: 1.2rem;

    z-index: 100;
    position: absolute;
    bottom: -22px;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const Navigator = styled.div`
  display: flex;
  align-items: center;
  color: #fff;
  cursor: pointer;
  background: #bd207b;
  padding: 10px;
  border-radius: 5px;
  position: absolute;
  top: 45%;
  right: ${(props) => props.right};
  left: ${(props) => props.left};

  z-index: 1;
  i {
    color: ${(props) => (props.disabled ? '#858585 !important' : '#fff !important')};
  }
`;

export const Row = styled.div`
  display: flex;
  justify-content: space-between;

  position: absolute;
  bottom: 20px;

  width: 100%;
  padding: 0 10px;
`;

export const ContentButtonClosePhoto = styled.div`
  position: fixed;
  cursor: pointer;
  top: -18px;
  z-index: 100;
  align-self: flex-end;
  margin-right: ${(props) => !props.orientation === 90 && '10px'};
  margin-bottom: 3px;
  background: #fff;
  border-radius: 50%;
  height: 2.5rem;
  width: 2.5rem;
  justify-content: center;
  display: flex;
  align-items: center;
  i {
    color: #f00 !important;
  }
`;
