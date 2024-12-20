import styled from 'styled-components';

export const Linha = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-left: 0 !important;
  /* width: 350px; */

  @media (max-width: 768px) {
    width: auto;
  }
  /* width: 100%; */
  /* padding: 10px; */
  margin: 5px 10px;
  display: flex;
  align-items: stretch;

  @media (max-width: 768px) {
    padding-top: 0px;
    flex-direction: column;
  }
  h2 {
    background: red;
  }

  h6 {
    margin-top: 0px;
    margin-bottom: 0px;
    word-break: break-all;
    font-size: 13px;
    color: #525252;
    font-weight: bold;
  }

  div.detail {
    padding: 0;
  }

  input[type='file'] {
    display: none;
  }
  .collapsible {
    box-shadow: unset !important;
    border: none !important;
    padding: 0 !important;
  }

  .collapsible-header {
    background-color: #fff;
    padding-bottom: 5px;
    padding: 0 !important;
    color: white;

    i {
      margin: 0;
      align-self: center;
    }
    label {
      font-weight: 700;
      text-transform: none;
      font-size: 1.2rem;
    }
    font-size: 01rem;
  }
  .collapsible.expandable {
    margin: 0 10px !important;
  }
  li.collapsible_ .collapsible-header {
    background: rgba(189, 32, 123, 0.04);

    color: #000 !important;
    i.material-icons {
      margin-right: 0 !important;
    }
  }
`;

export const DivDetalhe = styled.div`
  display: flex;
  align-items: center;
  /* flex-direction: column; */
  padding-top: 5px;
  p,
  span {
    user-select: text;
  }
  p {
    color: #9e9e9e !important;
    font-weight: 500 !important;
    text-transform: capitalize;
    padding-right: 10px;
  }
  span {
    word-break: break-all;
    font-weight: 700;
    color: #858585;
  }
  img.photoInList {
    width: 30px;
    height: 30px;
    cursor: pointer;
  }
  @media (max-width: 768px) {
    padding-top: 0px;
  }
`;
