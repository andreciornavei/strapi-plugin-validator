import styled from 'styled-components';

const TableContainer = styled.div`
  position: relative;
  font-family: 'Lato';
  box-shadow: 0 2px 4px #E3E9F3;
`

const TableHeader = styled.div`
  display:flex;
  position: relative;
  padding: 2.1rem 6rem 1.7rem 3rem;
  background-color: white;
`

const TableBody = styled.div`
  width: 100%;
  position: relative;
  border-radius: 2px;
  background: white;
  table-layout: fixed;
  & > table {
    border-collapse: collapse;
    width: 100%;
    min-width: 500px;
    font-family: 'Lato';
    & > tbody {
      color: #333740;
      & > tr {
        height: 5.4rem;
        background-color: transparent;
        &:hover {
          cursor: pointer;
          background-color: #f7f8f8;
        }
        & > td {
          padding: 0.75em;
          vertical-align: middle;
          font-size: 1.3rem;
          line-height: 1.8rem;
          &:first-of-type:not(:last-of-type) {
            padding-left: 30px;
          }
          &:last-of-type:not(:first-of-type) {
            padding-right: 30px;
          }
          &:last-child:not(:first-of-type) {
            font-size: 10px;
          }
          &:last-child {
            text-align: right;
          }

        }
        &:not(:first-of-type)::before {
           background-color: rgba(14,22,34,0.04);
        }
        &::before {
            content: '-';
            display: inline-block;
            line-height: 1.1em;
            color: transparent;
            background-color: transparent;
            position: absolute;
            left: 3rem;
            width: calc(100% - 6rem);
            height: 1px;
            margin-top: -1px;
        }
      }
    }
  }
`

const TableAction = styled.button`
  width: 100%;
  height: 54px;
  border: 0;
  border-top: 1px solid #aed4fb;
  color: #007eff;
  font-weight: 500;
  text-transform: uppercase;
  background-color: #e6f0fb;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  outline: none;
`;

export default {
  TableContainer,
  TableHeader,
  TableBody,
  TableAction
}