import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;
  height: 100%;

  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;

  padding: 0px 10px;
`;

export const Item = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.align ? props.align : 'center')};
`;

export const PTitle = styled.p`
  font-weight: 500;
`;

export const PData = styled.p`
  font-weight: 500;
  color: #858585;
`;

export const Row = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;

  margin: ${(props) => (props.withMargins ? '10px 0 !important' : '0')};

  a,
  button {
    max-height: 2.3rem !important;
  }
`;
