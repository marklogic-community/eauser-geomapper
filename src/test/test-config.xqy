(:
Copyright 2012-2015 MarkLogic Corporation

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
:)
xquery version "1.0-ml";

module namespace c = "http://marklogic.com/roxy/test-config";

(: configured at deploy time by Roxy deployer :)
declare variable $c:USER := "@ml.user";
declare variable $c:PASSWORD := "@ml.password";

declare variable $c:GUEST-ROLE := "@ml.app-role";
declare variable $c:EDITOR-ROLE := "@ml.app-name-editor-role";

(: If using the file system, Roxy won't substitute. Provide defaults. :)
declare function c:get-guest-role()
{
  if (fn:matches($c:GUEST-ROLE, "@ml")) then
    "eauser-geomapper-role"
  else
    $c:GUEST-ROLE
};

declare function c:get-editor-role()
{
  if (fn:matches($c:EDITOR-ROLE, "@ml")) then
    "eauser-geomapper-editor-role"
  else
    $c:EDITOR-ROLE
};
