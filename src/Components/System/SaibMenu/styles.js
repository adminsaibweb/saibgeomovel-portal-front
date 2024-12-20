import styled from 'styled-components';

export const LeftPanel = styled.div`
  .leftPanel {
    position: fixed;
    width: 64px;
    height: 100vh;
    background-color: #8e44ad;
    display: flex;
    align-items: center;
    justify-content: ${(props) =>
      props.largura === 300 ? 'flex-start' : 'center'};
    /* padding-left: ${(props) => (props.largura >= 300 ? '8px' : 'unset')}; */
    z-index: 2;
    @media (max-width: 768px) {
      /* width: ${(props) => (props.largura >= 300 ? 'flex' : 'none')}; */
      width: 100% !important;
    }
  }
`;

export const TelaEscuraFundo = styled.div`
  position: fixed;
  top: 0;
  left: 300px;
  right: 0;
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2;
  display: ${(props) => (props.largura === 300 ? 'block' : 'none')};
  height: 100vh;
  width: 100vw;
`;

export const IconeSaib = styled.div`
  position: fixed;
  width: 64px;
  height: 50px;
  background-color: #8e44ad;
  display: flex;
  align-items: center;
  justify-content: ${(props) =>
    props.largura === 300 ? 'flex-start' : 'center'};
  padding-left: ${(props) => (props.largura >= 300 ? '8px' : 'unset')};
  z-index: 2;
  top: 0px;
  @media (max-width: 768px) {
    /* width: ${(props) => (props.largura >= 300 ? 'flex' : 'none')}; */
    width: 100% !important;
  }
  .iconeSaib {
    img {
      cursor: pointer;
      width: 48px !important;
    }
    img:hover {
      filter: drop-shadow(-1px 0px 5px #fff);
    }
  }
  .dadosUsuarios {
    font-size: 12px;
    font-weight: 600;
    display: ${(props) => (props.largura === 300 ? 'flex' : 'none')};
    /* display: flex; */
    min-width: 244px;
    flex-direction: column;
    height: 100%;
    background-color: #8e44ad;
    color: white;

    p {
      display: flex;
      color: white;
      padding-left: 10px;
    }
  }
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);
`;

export const MenuSaib = styled.div`
  position: fixed;
  top: 50px;
  @media (max-width: 768px) {
    display: ${(props) => (props.largura >= 300 ? 'flex' : 'none')};
  }
  width: ${(props) => props.largura + 'px'};
  height: calc(100vh - 50px);
  background-color: #f7f7f7;
  display: flex;
  z-index: 2;
  flex-direction: column;
  align-items: flex-start;
  overflow-y: auto;
  overflow-x: hidden;
  transition: 0.1s;
`;

export const MenuItemModulo = styled.div`
  width: ${(props) => props.largura + 'px'};
  cursor: pointer;
  min-height: 64px;
  background-color: #f7f7f7;
  display: ${(props) =>
    props.menuProps.GME_GME_ID === 0 ||
    props.menuProps.GME_URL === '+' ||
    props.menuProps.GME_URL === '+P'
      ? 'flex'
      : 'none'};
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  z-index: 2;
  :hover {
    background-color: #f0f0f0;
  }
  span {
    display: flex;
    flex-direction: row;
    .iconeMenuItem {
      display: flex;
      width: 64px;
      align-items: center;
      flex-direction: column;
    }
    .botaoMenuItem {
      display: ${(props) => (props.largura === 300 ? 'flex' : 'none')};
      align-items: center;
      flex-direction: column;
      color: #858585;
      width: calc(100%-32px);
    }
  }
  .menuItemPai {
    align-items: center;
  }
`;

export const MenuSubItem = styled.div`
  width: ${(props) => props.largura + 'px'};
  cursor: pointer;
  min-height: 48px;
  background-color: #fff;
  display: ${(props) =>
    props.menuProps.GME_URL === '-' ||
    props.itensExpandir === props.menuProps.GME_GME_ID ||
    props.menuProps.GME_URL === '+' ||
    props.menuProps.GME_URL === '+P'
      ? 'flex'
      : 'none'};
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  padding-left: 10px;
  z-index: 2;
  :hover {
    background-color: #f0f0f0;
    border-left: 6px solid #8e44ad;
    padding-left: 4px;
  }
  .botaoMenuItem {
    display: ${(props) => (props.largura === 300 ? 'flex' : 'none')};
    align-items: center;
    flex-direction: column;
    color: #858585;
    width: calc(100%-32px);
  }
  span.subMenuItemPai {
    display: flex;
    width: 100%;
  }
`;

export const MenuItemSubModulo = styled.div`
  width: ${(props) => props.largura + 'px'};
  cursor: pointer;
  min-height: 48px;
  background-color: #fff;
  display: ${(props) =>
    props.menuProps.GME_URL === '+' ||
    props.menuProps.GME_URL === '+P' ||
    props.itensExpandir === props.menuProps.GME_ID ||
    props.itensExpandir === props.menuProps.GME_GME_ID
      ? 'flex'
      : 'none'};
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  padding-left: 10px;
  z-index: 2;
  :hover {
    background-color: #f0f0f0;
    border-left: 6px solid #8e44ad;
    padding-left: 4px;
  }
  .botaoMenuItem {
    display: ${(props) => (props.largura === 300 ? 'flex' : 'none')};
    align-items: center;
    flex-direction: column;
    color: #858585;
    width: calc(100%-32px);
  }
  span.subMenuItemPai {
    display: flex;
    width: 100%;
    align-items: center;
  }
`;
