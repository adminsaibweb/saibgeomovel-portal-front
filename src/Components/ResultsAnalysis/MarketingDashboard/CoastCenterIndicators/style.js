import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 0.9rem;
  justify-content: space-between;
  width: 100%;
  flex-wrap: wrap;
  @media (max-width: 768px) {
    margin-left: 0px;
    height: auto;
    flex-direction: column;
    padding-bottom: unset;
  }
`;

export const Linha = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  padding: 0px;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  @media (max-width: 768px) {
    padding-top: 0px;
    flex-direction: column;
  }
 .collapsible-header {
    padding-bottom: 4px;
    border-bottom: unset;
    background-color: white;
    color: #8e44ad;
    font-weight: 900;
    text-transform: capitalize;
    /* border: 1px solid #ccc; */
    /* box-shadow: -1px 1px 5px 1px rgba(0,0,0,0.1); */
    padding: 5px;
  }
  .collapsible-body {
    padding: 0px;
    margin-bottom: 10px;
    border-bottom: unset;
  }
`;

export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    max-width: 100%;
  }
  h6 {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 2px !important;
    text-align: center;
    color: #444141;

  }
  @media (max-width: 768px) {
    padding-top: 10px;
    width: 100%;
  }
  table {
    /* line-height: 0px; */
  }
  .titleApproved {
    color: rgb(41, 128, 185);
    text-align: right;
    width: 32px;
  }
  .titleNotApproved {
    color: rgb(231, 76, 60);
    text-align: right;
    width: 32px;
  }  
  .valueApproved {
    color: rgb(41, 128, 185);
    font-weight: 700;
    text-align: right;
  }
  .valueNotApproved {
    color: rgb(231, 76, 60);
    font-weight: 700;
    text-align: right;
  }
  tr:hover{
    background-color: unset!important;
    color: unset!important;
  }
`;

export const SubContainer = styled.div`
  margin: 5px;
  padding: 5px;
  background-color: white;
  border: 1px solid #f1f1f1;
  border-radius: 4px;
  width: calc(100vw - 90px);
  box-shadow: -1px 1px 5px 1px rgba(0, 0, 0, 0.1);
  @media (max-width: 768px) {
    flex-direction: column;
    width: calc(100vw - 20px) !important;
  }
`;
