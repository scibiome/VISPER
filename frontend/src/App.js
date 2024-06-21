import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './components/Upload/Login';
import Upload from './components/Upload/Upload';
import Database from './components/Database/Database';
import Graph from './components/Graph/Graph';
import ListSearch from './components/ListSearch/ListSearch';
import Overview from './components/Overview/Overview';
import FAQ from './components/FAQ/FAQ';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ListSearch/>}/>
        <Route path="/Upload" element={<Upload/>}/>
        <Route path="/Login" element={<Login/>}/>
        <Route path="/Database" element={<Database/>}/>
        <Route path="/Graph" element={<Graph/>}/>
        <Route path="/ListSearch" element={<ListSearch/>}/>
        <Route path="/Overview" element={<Overview/>}/>
        <Route path="/FAQ" element={<FAQ/>}/>
      </Routes>
    </BrowserRouter>
  );
}
