import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;

  width: 300px;
  margin: 5px;

  border-radius: 3px;
  border: 1px solid #7e3a9d;

  div:nth-child(2) {
    padding-left: 5px;
  }
`;

export const Header = styled.div`
  background: #bd207b;
  color: #fff;

  display: flex;
  justify-content: space-between;
  padding: 3px 4px;
  border-radius: 2px 2px 0 0;
`;
