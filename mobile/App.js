import React,{useState} from "react";
import {SafeAreaView,View,Text,TextInput,Pressable,FlatList,KeyboardAvoidingView,Platform,StyleSheet} from "react-native";
import {StatusBar} from "expo-status-bar";

const API_URL=process.env.EXPO_PUBLIC_API_URL||"https://nagi-glass-1g3gvdzrz-p9sdk8f8jt-sudo.vercel.app/api/chat";

export default function App(){
 const [message,setMessage]=useState("");
 const [messages,setMessages]=useState([{id:"1",role:"assistant",text:"凪CORE 起動しました。"}]);
 const [loading,setLoading]=useState(false);
 async function sendMessage(){
  const text=message.trim(); if(!text||loading)return;
  setMessage(""); setMessages(p=>[...p,{id:Date.now().toString(),role:"user",text}]); setLoading(true);
  try{
   const r=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:text})});
   const d=await r.json(); if(!r.ok)throw new Error(d?.error||"AI接続エラー");
   setMessages(p=>[...p,{id:(Date.now()+1).toString(),role:"assistant",text:d.reply||"返答を取得できなかったよ。"}]);
  }catch(e){
   setMessages(p=>[...p,{id:(Date.now()+1).toString(),role:"assistant",text:"AI接続エラー："+e.message}]);
  }finally{setLoading(false);}
 }
 return <SafeAreaView style={s.safe}><StatusBar style="light"/><KeyboardAvoidingView style={s.container} behavior={Platform.OS==="ios"?"padding":undefined}>
  <View style={s.header}><Text style={s.title}>凪CORE</Text><Text style={s.status}>● ONLINE / AI READY</Text></View>
  <FlatList style={s.list} contentContainerStyle={s.messages} data={messages} keyExtractor={i=>i.id} renderItem={({item})=><View style={[s.bubble,item.role==="user"?s.user:s.ai]}><Text style={s.bubbleText}>{item.text}</Text></View>}/>
  {loading&&<Text style={s.thinking}>凪、考え中…</Text>}
  <View style={s.inputRow}><TextInput style={s.input} value={message} onChangeText={setMessage} placeholder="凪に話しかける…" placeholderTextColor="#78909c" multiline/><Pressable style={s.send} onPress={sendMessage}><Text style={s.sendText}>送信</Text></Pressable></View>
 </KeyboardAvoidingView></SafeAreaView>;
}
const s=StyleSheet.create({
 safe:{flex:1,backgroundColor:"#071014"},container:{flex:1,paddingHorizontal:18},header:{paddingTop:18,paddingBottom:14},
 title:{color:"#e8f1f2",fontSize:28,fontWeight:"700"},status:{color:"#72e6c1",fontSize:11,marginTop:4,letterSpacing:1},
 list:{flex:1},messages:{paddingVertical:12,gap:10},bubble:{maxWidth:"86%",borderRadius:18,paddingHorizontal:15,paddingVertical:11},
 ai:{alignSelf:"flex-start",backgroundColor:"#122127",borderWidth:1,borderColor:"#243b43"},user:{alignSelf:"flex-end",backgroundColor:"#193c39"},
 bubbleText:{color:"#e6eeee",fontSize:16,lineHeight:23},thinking:{color:"#7fa2aa",paddingVertical:6},
 inputRow:{flexDirection:"row",alignItems:"flex-end",gap:8,paddingVertical:10},input:{flex:1,minHeight:48,maxHeight:120,borderRadius:16,backgroundColor:"#101c21",borderWidth:1,borderColor:"#294047",color:"#eef5f5",paddingHorizontal:14,paddingVertical:12,fontSize:16},
 send:{height:48,paddingHorizontal:15,borderRadius:16,backgroundColor:"#1d6b5c",justifyContent:"center"},sendText:{color:"#fff",fontWeight:"700"}
});