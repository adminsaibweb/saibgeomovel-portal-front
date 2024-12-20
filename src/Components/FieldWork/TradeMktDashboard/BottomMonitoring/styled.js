import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 250px;
  max-height: 30%;
  /* min-height: 150px; */

  /* margin: 20px 0 20px; */

  /* box-shadow: -1px 1px 5px 1px rgb(0 0 0 / 10%); */
`;

export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;
  height: 100% !important;
  padding-right: ${(props) =>
    props.paddingRight ? props.paddingRight : 'unset'};
  flex: ${(props) => (props.flex ? props.flex : 'unset')};
  @media (max-width: 768px) {
    padding-top: 0px;
  }
`;
